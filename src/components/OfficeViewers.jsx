import React, { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Printer,
  Table,
  Layers,
  AlertCircle
} from 'lucide-react';

/**
 * Word Document Viewer (DOCX / DOC)
 */
export function DocxViewer({ blob, blobUrl, filename, downloadUrl, viewUrl, onDownload }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let isMounted = true;
    if ((!blob && !blobUrl) || !containerRef.current) return;

    setLoading(true);
    setError(null);
    containerRef.current.innerHTML = '';

    // Check if filename indicates old binary .doc format
    const lowerName = (filename || '').toLowerCase();
    if (lowerName.endsWith('.doc') && !lowerName.endsWith('.docx')) {
      // Old binary format may fail in docx-preview
      setLoading(false);
      setError('legacy-doc');
      return;
    }

    const resolveBlob = async () => {
      if (blob) return blob;
      if (blobUrl) {
        const res = await fetch(blobUrl);
        return await res.blob();
      }
      return null;
    };

    resolveBlob()
      .then((resolvedBlob) => {
        if (!resolvedBlob) throw new Error('No blob data found');
        return renderAsync(resolvedBlob, containerRef.current, null, {
          className: 'docx-preview-container',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          experimental: true,
          trimXmlDeclaration: true
        });
      })
      .then(() => {
        if (isMounted) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to render DOCX inline:', err);
        if (isMounted) {
          setError('render-failed');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [blob, blobUrl, filename]);

  const handlePrint = () => {
    if (!containerRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename || 'Document Print'}</title>
          <style>
            body { font-family: Calibri, Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 6px; }
          </style>
        </head>
        <body>${containerRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2 text-sky-400 font-semibold">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs">{filename}</span>
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider">
            Word Document
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-slate-300 font-mono text-[11px] min-w-[42px] text-center select-none font-bold">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center space-x-1 border border-slate-700 transition cursor-pointer"
            title="Print Document"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Document View Body */}
      <div className="flex-1 overflow-auto bg-slate-900/60 p-4 sm:p-8 flex justify-center relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-10 text-sky-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Rendering Word Document...</span>
          </div>
        )}

        {error ? (
          <div className="m-auto max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {error === 'legacy-doc' ? 'Older Word (.doc) Format' : 'Document Preview Limitation'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {error === 'legacy-doc'
                  ? 'This file is in legacy binary .doc format. Please open or download to view in Microsoft Word, or convert to .docx for native inline rendering.'
                  : `Unable to render ${filename} inline. You can open or download the original file directly.`}
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              {viewUrl && (
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center transition"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Open in New Tab
                </a>
              )}
              {onDownload ? (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition cursor-pointer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                </button>
              ) : downloadUrl && (
                <a
                  href={downloadUrl}
                  download={filename}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 w-full max-w-4xl text-slate-900 select-text
              [&_.docx-wrapper]:bg-transparent [&_.docx-wrapper]:p-0
              [&_.docx]:bg-white [&_.docx]:text-slate-900 [&_.docx]:shadow-2xl [&_.docx]:rounded-xl [&_.docx]:p-10 [&_.docx]:my-4 [&_.docx]:border [&_.docx]:border-slate-300
              [&_table]:border-collapse [&_table]:w-full [&_table]:my-3
              [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100 [&_th]:text-slate-800
              [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_td]:text-slate-800
              [&_p]:my-2 [&_p]:leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Excel Spreadsheet Viewer (XLSX / XLS / CSV)
 */
export function ExcelViewer({ blob, blobUrl, filename, downloadUrl, viewUrl, onDownload }) {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [sheetData, setSheetData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!blob && !blobUrl) return;

    setLoading(true);
    setError(null);

    const resolveBlob = async () => {
      if (blob) return blob;
      if (blobUrl) {
        const res = await fetch(blobUrl);
        return await res.blob();
      }
      return null;
    };

    resolveBlob()
      .then((resolvedBlob) => {
        if (!resolvedBlob) throw new Error('No spreadsheet data found');
        return resolvedBlob.arrayBuffer();
      })
      .then((buffer) => {
        const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
        if (!isMounted) return;
        setWorkbook(wb);
        setSheetNames(wb.SheetNames || []);
        setActiveSheetIndex(0);

        if (wb.SheetNames && wb.SheetNames.length > 0) {
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
          setSheetData(rows);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to parse Excel file:', err);
        if (isMounted) {
          setError('Failed to parse spreadsheet file.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [blob, blobUrl]);

  // Handle Sheet tab switch
  const handleSheetChange = (index) => {
    if (!workbook || !sheetNames[index]) return;
    setActiveSheetIndex(index);
    const sheet = workbook.Sheets[sheetNames[index]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    setSheetData(rows);
  };

  // Filter rows based on search
  const filteredRows = searchQuery.trim()
    ? sheetData.filter((row, idx) => {
        if (idx === 0) return true; // keep header row
        const q = searchQuery.toLowerCase();
        return row.some((cell) => String(cell || '').toLowerCase().includes(q));
      })
    : sheetData;

  // Maximum column count across all rows
  const maxCols = sheetData.reduce((max, r) => Math.max(max, r.length), 0);

  // Column letters (A, B, C... AA, AB...)
  const getColLetter = (colIdx) => {
    let temp = colIdx;
    let letter = '';
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2.5 text-emerald-400 font-semibold">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs">{filename}</span>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider">
            Excel Spreadsheet
          </span>
          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
            ({sheetData.length} rows, {maxCols} cols)
          </span>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search cells..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
            />
          </div>
          {onDownload ? (
            <button
              type="button"
              onClick={onDownload}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition cursor-pointer shadow-xs"
              title="Download Excel Spreadsheet"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </button>
          ) : downloadUrl && (
            <a
              href={downloadUrl}
              download={filename}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition shadow-xs"
              title="Download Excel Spreadsheet"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download
            </a>
          )}
        </div>
      </div>

      {/* Spreadsheet Content Grid */}
      <div className="flex-1 overflow-auto bg-slate-950 p-2 relative">
        {loading ? (
          <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center space-y-3 text-emerald-400 z-10">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Loading spreadsheet data...</span>
          </div>
        ) : error ? (
          <div className="m-auto max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Spreadsheet Preview</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              {onDownload ? (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition cursor-pointer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download Spreadsheet
                </button>
              ) : downloadUrl && (
                <a
                  href={downloadUrl}
                  download={filename}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download Spreadsheet
                </a>
              )}
            </div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs font-medium">
            No rows found in this sheet.
          </div>
        ) : (
          <div className="inline-block min-w-full align-middle">
            <table className="border-collapse text-xs text-slate-200 w-full select-text">
              {/* Header: Column Letters */}
              <thead className="sticky top-0 z-20 bg-slate-850 shadow-xs">
                <tr>
                  <th className="w-12 px-2 py-1.5 bg-slate-850 border border-slate-700 text-slate-400 font-mono text-[10px] text-center sticky left-0 z-30">
                    #
                  </th>
                  {Array.from({ length: maxCols }).map((_, colIdx) => (
                    <th
                      key={colIdx}
                      className="px-3 py-1.5 bg-slate-850 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold text-center tracking-wider min-w-[90px]"
                    >
                      {getColLetter(colIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIdx) => {
                  const isFirstRow = rowIdx === 0 && !searchQuery;
                  return (
                    <tr
                      key={rowIdx}
                      className={`hover:bg-slate-800/80 transition-colors ${
                        isFirstRow ? 'bg-slate-850/80 font-bold text-white' : 'even:bg-slate-900/60'
                      }`}
                    >
                      {/* Row Number */}
                      <td className="px-2 py-1 border border-slate-800 text-slate-500 font-mono text-[10px] text-center sticky left-0 z-10 bg-slate-850 select-none">
                        {rowIdx + 1}
                      </td>
                      {/* Cells */}
                      {Array.from({ length: maxCols }).map((_, colIdx) => {
                        const cellVal = row[colIdx] !== undefined ? String(row[colIdx]) : '';
                        const isMatch =
                          searchQuery.trim() && cellVal.toLowerCase().includes(searchQuery.toLowerCase());
                        return (
                          <td
                            key={colIdx}
                            className={`px-3 py-1.5 border border-slate-800/80 whitespace-nowrap text-xs max-w-xs truncate ${
                              isMatch ? 'bg-amber-400/20 text-amber-200 font-bold' : ''
                            }`}
                            title={cellVal}
                          >
                            {cellVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sheet Tabs Bar */}
      {sheetNames.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center space-x-1">
            <Table className="h-3 w-3" />
            <span>Sheets:</span>
          </span>
          {sheetNames.map((name, idx) => {
            const isActive = idx === activeSheetIndex;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSheetChange(idx)}
                className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * PowerPoint Presentation Viewer (PPTX / PPT)
 */
export function PptxViewer({ blob, blobUrl, filename, downloadUrl, viewUrl, onDownload }) {
  const [slides, setSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!blob && !blobUrl) return;

    setLoading(true);
    setError(null);

    const lowerName = (filename || '').toLowerCase();
    if (lowerName.endsWith('.ppt') && !lowerName.endsWith('.pptx')) {
      // Legacy binary .ppt
      setLoading(false);
      setError('legacy-ppt');
      return;
    }

    const resolveBlob = async () => {
      if (blob) return blob;
      if (blobUrl) {
        const res = await fetch(blobUrl);
        return await res.blob();
      }
      return null;
    };

    resolveBlob()
      .then((resolvedBlob) => {
        if (!resolvedBlob) throw new Error('No presentation data found');
        return JSZip.loadAsync(resolvedBlob);
      })
      .then(async (zip) => {
        // Find all slide XML files
        const slideFileNames = Object.keys(zip.files)
          .filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/))
          .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
            const numB = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
            return numA - numB;
          });

        if (slideFileNames.length === 0) {
          throw new Error('No slides found in presentation package');
        }

        const parsedSlides = [];

        for (let i = 0; i < slideFileNames.length; i++) {
          const slidePath = slideFileNames[i];
          const xmlText = await zip.file(slidePath).async('string');

          // Parse XML using DOMParser
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

          // Extract Title
          let title = '';
          const titleShape = xmlDoc.querySelector('p\\:sp, sp');
          const titleTextNode = xmlDoc.querySelector(
            'p\\:nvSpPr p\\:ph[type="title"], p\\:nvSpPr p\\:ph[type="ctrTitle"]'
          );
          if (titleTextNode) {
            const sp = titleTextNode.closest('p\\:sp, sp');
            if (sp) {
              const tNodes = sp.querySelectorAll('a\\:t, t');
              title = Array.from(tNodes)
                .map((n) => n.textContent)
                .join(' ')
                .trim();
            }
          }

          // Extract all paragraph text runs
          const paragraphs = [];
          const pNodes = xmlDoc.querySelectorAll('a\\:p, p');
          pNodes.forEach((p) => {
            const textRuns = p.querySelectorAll('a\\:t, t');
            const pText = Array.from(textRuns)
              .map((n) => n.textContent)
              .join('')
              .trim();
            if (pText && pText !== title) {
              paragraphs.push(pText);
            }
          });

          // Check for slide relationships to extract images
          const relsPath = slidePath.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
          const slideImages = [];
          if (zip.file(relsPath)) {
            const relsXml = await zip.file(relsPath).async('string');
            const relsDoc = parser.parseFromString(relsXml, 'text/xml');
            const relNodes = relsDoc.querySelectorAll('Relationship');
            for (let r = 0; r < relNodes.length; r++) {
              const target = relNodes[r].getAttribute('Target') || '';
              if (target.includes('media/')) {
                const mediaPath = 'ppt/' + target.replace(/^..\//, '');
                if (zip.file(mediaPath)) {
                  const imgData = await zip.file(mediaPath).async('blob');
                  const imgUrl = URL.createObjectURL(imgData);
                  slideImages.push(imgUrl);
                }
              }
            }
          }

          parsedSlides.push({
            slideNumber: i + 1,
            title: title || `Slide ${i + 1}`,
            paragraphs,
            images: slideImages
          });
        }

        if (isMounted) {
          setSlides(parsedSlides);
          setActiveSlideIndex(0);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to parse PPTX file:', err);
        if (isMounted) {
          setError('Failed to extract PowerPoint presentation slides.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [blob, filename]);

  const currentSlide = slides[activeSlideIndex];

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      {/* Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2.5 text-amber-400 font-semibold">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Presentation className="h-4 w-4" />
          </div>
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-xs">{filename}</span>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider">
            PowerPoint
          </span>
          {slides.length > 0 && (
            <span className="text-slate-400 text-xs font-mono font-bold">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>
          )}
        </div>

        {/* Navigation Controls */}
        {slides.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((idx) => Math.max(0, idx - 1))}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={activeSlideIndex === slides.length - 1}
              onClick={() => setActiveSlideIndex((idx) => Math.min(slides.length - 1, idx + 1))}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Slide Presentation Stage */}
      <div className="flex-1 overflow-auto bg-slate-950/80 p-4 sm:p-8 flex items-center justify-center relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-amber-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Rendering PowerPoint Presentation...</span>
          </div>
        ) : error ? (
          <div className="max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {error === 'legacy-ppt' ? 'Legacy PowerPoint (.ppt) Format' : 'Presentation Preview'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {error === 'legacy-ppt'
                  ? 'This presentation is in older binary .ppt format. Please open or download to view in PowerPoint, or convert to .pptx for native presentation slides.'
                  : error}
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              {viewUrl && (
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center transition"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Open in New Tab
                </a>
              )}
              {onDownload ? (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition cursor-pointer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                </button>
              ) : downloadUrl && (
                <a
                  href={downloadUrl}
                  download={filename}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                </a>
              )}
            </div>
          </div>
        ) : currentSlide ? (
          <div className="w-full max-w-4xl aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden select-text animate-fade-in">
            {/* Slide Header */}
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Slide #{currentSlide.slideNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {currentSlide.title}
              </h2>
            </div>

            {/* Slide Body */}
            <div className="flex-1 py-6 overflow-y-auto space-y-3">
              {currentSlide.paragraphs.length > 0 ? (
                currentSlide.paragraphs.map((p, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-sm text-slate-200 leading-relaxed">
                    <span className="text-amber-400 font-black mt-1">•</span>
                    <span className="flex-1 font-medium">{p}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Slide contains graphic elements or tables.</p>
              )}

              {/* Extracted Images */}
              {currentSlide.images && currentSlide.images.length > 0 && (
                <div className="pt-4 grid grid-cols-2 gap-4">
                  {currentSlide.images.map((imgUrl, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={imgUrl}
                      alt={`Slide illustration ${imgIdx + 1}`}
                      className="max-h-48 w-auto object-contain rounded-lg border border-slate-700 bg-black/40 shadow-md"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{filename}</span>
              <span className="font-bold text-slate-400">
                {activeSlideIndex + 1} / {slides.length}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Slide Thumbnails Strip */}
      {slides.length > 1 && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center space-x-1">
            <Layers className="h-3 w-3" />
            <span>Deck:</span>
          </span>
          {slides.map((s, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>Slide {s.slideNumber}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
