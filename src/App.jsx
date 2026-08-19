import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  UploadCloud,
  History,
  Share2,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Download,
  ExternalLink,
  Lock,
  User,
  Building,
  RefreshCw,
  Search,
  Filter,
  FileCheck,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
  LogOut,
  BarChart3,
  Compass,
  Award,
  ShieldAlert,
  Wrench,
  ClipboardList,
  Folder,
  File,
  ChevronLeft,
  MoreVertical,
  MessageSquare,
  MessageCircle,
  Send,
  FolderKanban,
  KeyRound,
  Mail
} from 'lucide-react';
import api, { authAPI, submittalsAPI, documentsAPI, shareAPI, tenderAPI, contractualAPI, generalDocsAPI } from './utils/api';

function App() {
  // Authentication & RBAC states
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState('Project Details');

  // Captcha states
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  // Forgot Password modal states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotUserId, setForgotUserId] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotCaptchaCode, setForgotCaptchaCode] = useState('');
  const [forgotCaptchaInput, setForgotCaptchaInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const generateForgotCaptcha = () => {
    const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForgotCaptchaCode(code);
    setForgotCaptchaInput('');
  };

  const handleOpenForgotPassword = () => {
    setForgotUserId('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotErrorMsg('');
    setForgotSubmitted(false);
    generateForgotCaptcha();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotErrorMsg('');

    if (!forgotUserId.trim()) {
      setForgotErrorMsg('Please enter your User ID or Registered Email.');
      return;
    }

    if (!forgotNewPassword.trim()) {
      setForgotErrorMsg('Please enter your new password.');
      return;
    }

    if (forgotNewPassword.length < 4) {
      setForgotErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotErrorMsg('New password and confirm password do not match!');
      return;
    }

    if (!forgotCaptchaInput.trim()) {
      setForgotErrorMsg('Please enter the CAPTCHA verification code.');
      return;
    }

    if (forgotCaptchaInput.trim().toUpperCase() !== forgotCaptchaCode.toUpperCase()) {
      setForgotErrorMsg('Invalid CAPTCHA code! Please try again.');
      generateForgotCaptcha();
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword(forgotUserId, forgotNewPassword);
      if (res.success) {
        setForgotSubmitted(true);
      }
    } catch (err) {
      setForgotErrorMsg(err.response?.data?.message || 'Password reset failed. Please check your User ID.');
      generateForgotCaptcha();
    } finally {
      setForgotLoading(false);
    }
  };

  // Data lists
  const [matrixItems, setMatrixItems] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalMatrixCount: 22,
    totalDocs: 0,
    pendingDocs: 0,
    commentsIssued: 0,
    employerApproved: 0,
    transmittedDocs: 0
  });

  // UI state filters & tabs
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'documents' | 'logs'
  const [matrixSearch, setMatrixSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Tender Documents States
  const [tenderDocs, setTenderDocs] = useState([]);
  const [tenderFolders, setTenderFolders] = useState([]);
  const [folderPath, setFolderPath] = useState([]);
  const currentFolder = folderPath[folderPath.length - 1] || null;
  const selectedTenderFolder = currentFolder ? currentFolder.name : null;
  const selectedTenderFolderId = currentFolder ? currentFolder._id : null;
  const [showTenderUploadModal, setShowTenderUploadModal] = useState(false);
  const [showTenderFolderModal, setShowTenderFolderModal] = useState(false);
  const [tenderFolderNameInput, setTenderFolderNameInput] = useState('');
  const [tenderFolderCreating, setTenderFolderCreating] = useState(false);
  const [tenderUploadFile, setTenderUploadFile] = useState(null);
  const [tenderUploadName, setTenderUploadName] = useState('');
  const [tenderUploading, setTenderUploading] = useState(false);
  const [tenderLoading, setTenderLoading] = useState(false);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState(null);
  const [activeFileMenuId, setActiveFileMenuId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameFileId, setRenameFileId] = useState(null);
  const [renameFileNameInput, setRenameFileNameInput] = useState('');
  const [renameFileSaving, setRenameFileSaving] = useState(false);

  // Remark Modal State
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedDocForRemark, setSelectedDocForRemark] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkSaving, setRemarkSaving] = useState(false);

  const handleOpenRemarkModal = (doc) => {
    setSelectedDocForRemark(doc);
    setRemarkText('');
    setShowRemarkModal(true);
  };

  const handleSaveRemark = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDocForRemark || !remarkText.trim()) return;
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    setRemarkSaving(true);
    try {
      const res = await generalDocsAPI.updateRemark(apiSec, selectedDocForRemark._id, remarkText);
      if (res.success) {
        setRemarkText('');
        if (res.data) {
          setSelectedDocForRemark(res.data);
        }
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post remark');
    } finally {
      setRemarkSaving(false);
    }
  };

  // File Preview Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTextContent, setPreviewTextContent] = useState('');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMatrixItem, setSelectedMatrixItem] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocNumber, setUploadDocNumber] = useState('');
  const [uploadRevision, setUploadRevision] = useState('0');
  const [uploadComments, setUploadComments] = useState('');
  const [uploading, setUploading] = useState(false);

  // Upload Revision State (existing docs)
  const [selectedDocForRevision, setSelectedDocForRevision] = useState(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDocForReview, setSelectedDocForReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewComments, setReviewComments] = useState('');

  // Transmit Modal State
  const [showTransmitModal, setShowTransmitModal] = useState(false);
  const [selectedDocForTransmit, setSelectedDocForTransmit] = useState(null);
  const [transmitToRole, setTransmitToRole] = useState("Employer's Office");
  const [transmitComments, setTransmitComments] = useState('');

  // Hard Copy Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDocForVerify, setSelectedDocForVerify] = useState(null);
  const [verifyA1, setVerifyA1] = useState(0);
  const [verifyA3, setVerifyA3] = useState(0);
  const [verifyA4, setVerifyA4] = useState(0);

  // Secure Link Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVersionForShare, setSelectedVersionForShare] = useState(null);
  const [selectedDocForShare, setSelectedDocForShare] = useState(null);
  const [shareExpiresHours, setShareExpiresHours] = useState('24');
  const [sharePasscode, setSharePasscode] = useState('');
  const [generatedShareLink, setGeneratedShareLink] = useState('');

  // Document History Timeline Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyDoc, setHistoryDoc] = useState(null);

  // Secure Link Guest Access View State (Simulating an external recipient)
  const [guestMode, setGuestMode] = useState(false);
  const [guestToken, setGuestToken] = useState('');
  const [guestPasscode, setGuestPasscode] = useState('');
  const [guestShareData, setGuestShareData] = useState(null);
  const [guestDocData, setGuestDocData] = useState(null);
  const [guestError, setGuestError] = useState('');

  // Hard Copy Handover Print Receipt View
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [receiptDoc, setReceiptDoc] = useState(null);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      const [matrixRes, docsRes, statsRes] = await Promise.all([
        submittalsAPI.getMatrix(),
        documentsAPI.list(),
        submittalsAPI.getStats()
      ]);
      if (matrixRes.success) setMatrixItems(matrixRes.data);
      if (docsRes.success) setDocuments(docsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Check auth on load
  useEffect(() => {
    generateCaptcha();
    const checkAuth = async () => {
      const token = localStorage.getItem('pmis_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem('pmis_user', JSON.stringify(res.user));
            loadDashboardData();
          } else {
            authAPI.logout();
            setCurrentUser(null);
          }
        } catch (err) {
          authAPI.logout();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaInput.trim()) {
      setErrorMsg('Please enter the CAPTCHA code.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg('Invalid CAPTCHA code! Please try again.');
      generateCaptcha();
      return;
    }

    try {
      const res = await authAPI.login(loginEmail, loginPassword);
      if (res.success) {
        setCurrentUser(res.user);
        loadDashboardData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Try again.');
      generateCaptcha();
    }
  };

  // Switch Quick Login Roles for testing/demo
  const handleQuickRoleSwitch = async (roleEmail) => {
    setErrorMsg('');
    try {
      const res = await authAPI.login(roleEmail, 'password123');
      if (res.success) {
        setCurrentUser(res.user);
        loadDashboardData();
        // Clear guest modes
        setGuestMode(false);
        setGuestShareData(null);
        setGuestDocData(null);
      }
    } catch (err) {
      setErrorMsg('Role switch failed.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setMatrixItems([]);
    setDocuments([]);
    generateCaptcha();
  };

  // Handle Document Upload (Initial package)
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('documentNumber', uploadDocNumber);
      formData.append('submittalMatrixId', selectedMatrixItem._id);
      formData.append('comments', uploadComments);
      formData.append('file', uploadFile);

      const res = await documentsAPI.upload(formData);
      if (res.success) {
        setShowUploadModal(false);
        // Reset inputs
        setUploadTitle('');
        setUploadDocNumber('');
        setUploadComments('');
        setUploadFile(null);
        // Refresh
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle Revision Upload (Existing package)
  const handleRevisionUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('revision', uploadRevision);
      formData.append('comments', uploadComments);
      formData.append('file', uploadFile);

      const res = await documentsAPI.uploadRevision(selectedDocForRevision._id, formData);
      if (res.success) {
        setSelectedDocForRevision(null);
        setUploadRevision('0');
        setUploadComments('');
        setUploadFile(null);
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Revision upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle Document Review (Status issue/Approval)
  const handleDocReview = async (e) => {
    e.preventDefault();
    try {
      const res = await documentsAPI.review(selectedDocForReview._id, reviewStatus, reviewComments);
      if (res.success) {
        setShowReviewModal(false);
        setReviewComments('');
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    }
  };

  // Handle Document Transmission
  const handleDocTransmit = async (e) => {
    e.preventDefault();
    try {
      const res = await documentsAPI.transmit(selectedDocForTransmit._id, transmitToRole, transmitComments);
      if (res.success) {
        setShowTransmitModal(false);
        setTransmitComments('');
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Transmission failed');
    }
  };

  // Handle Hard Copy Verification
  const handleVerifyHardCopies = async (e) => {
    e.preventDefault();
    try {
      const res = await documentsAPI.verifyHardCopies(selectedDocForVerify._id, {
        A1: verifyA1,
        A3: verifyA3,
        A4: verifyA4
      });
      if (res.success) {
        setShowVerifyModal(false);
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Paper copy logging failed');
    }
  };

  // Handle Secure Link Generation
  const handleGenerateShareLink = async (e) => {
    e.preventDefault();
    try {
      const res = await shareAPI.generateLink(
        selectedDocForShare._id,
        selectedVersionForShare._id,
        shareExpiresHours,
        sharePasscode
      );
      if (res.success) {
        const fullLink = `${window.location.origin}?shareToken=${res.data.token}`;
        setGeneratedShareLink(fullLink);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Link generation failed');
    }
  };

  // Handle Secure Link Guest Validation
  const handleVerifyGuestLink = async (tokenVal) => {
    setGuestError('');
    try {
      const res = await shareAPI.verifyToken(tokenVal);
      if (res.success) {
        setGuestShareData(res.data);
      }
    } catch (err) {
      setGuestError(err.response?.data?.message || 'Invalid or expired secure link');
    }
  };

  // Handle Secure Link Access Payload retrieve
  const handleAccessGuestLink = async (e) => {
    e.preventDefault();
    setGuestError('');
    try {
      const res = await shareAPI.accessLink(guestToken, guestPasscode);
      if (res.success) {
        setGuestDocData(res.data);
      }
    } catch (err) {
      setGuestError(err.response?.data?.message || 'Passcode incorrect');
    }
  };

  // Check URL query parameters for active sharing link on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('shareToken');
    if (token) {
      setGuestToken(token);
      setGuestMode(true);
      handleVerifyGuestLink(token);
    }
  }, []);

  // Show detailed revision history logs
  const openHistoryModal = async (doc) => {
    try {
      const res = await documentsAPI.getDetails(doc._id);
      if (res.success) {
        setHistoryDoc(res.data);
        setShowHistoryModal(true);
      }
    } catch (err) {
      alert('Failed to load document history');
    }
  };

  // Printable receipt view
  const openPrintReceipt = async (doc) => {
    try {
      const res = await documentsAPI.getDetails(doc._id);
      if (res.success) {
        setReceiptDoc(res.data);
        setShowPrintReceipt(true);
      }
    } catch (err) {
      alert('Failed to load transmission metadata for receipt');
    }
  };

  const generalDocSections = [
    'Tender Documents',
    'Contractual',
    'Project Monitoring & Control',
    'Project Drawings',
    'Quality Management',
    'Environment, Health, and Safety (EHS)',
    'MEP',
    'Project Documents & Registration'
  ];

  const getApiSectionName = (secName) => {
    switch (secName) {
      case 'Tender Documents': return 'tender';
      case 'Contractual': return 'contractual';
      case 'Project Monitoring & Control': return 'monitor';
      case 'Project Drawings': return 'drawing';
      case 'Quality Management': return 'quality';
      case 'Environment, Health, and Safety (EHS)': return 'ehs';
      case 'MEP': return 'mep';
      case 'Project Documents & Registration': return 'registrations';
      default: return '';
    }
  };

  // Fetch general documents and folders when active section changes
  useEffect(() => {
    if (generalDocSections.includes(activeSection) && currentUser) {
      setFolderPath([]); // Reset folder path when switching sections
      fetchGeneralDocs();
    }
  }, [activeSection, currentUser]);

  const fetchGeneralDocs = async () => {
    if (!currentUser) return;
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    setTenderLoading(true);
    try {
      const [docsRes, foldersRes] = await Promise.all([
        generalDocsAPI.list(apiSec),
        generalDocsAPI.getFolders(apiSec)
      ]);

      if (docsRes.success) {
        setTenderDocs(docsRes.data);
      }
      if (foldersRes.success) {
        setTenderFolders(foldersRes.data);
      }
    } catch (err) {
      console.error(`Failed to load ${activeSection} documents & folders:`, err);
    } finally {
      setTenderLoading(false);
    }
  };

  const handleCreateTenderFolder = async (e) => {
    e.preventDefault();
    if (!tenderFolderNameInput) {
      alert('Please enter a folder name');
      return;
    }
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    setTenderFolderCreating(true);
    try {
      const res = await generalDocsAPI.createFolder(apiSec, tenderFolderNameInput, selectedTenderFolderId);
      if (res.success) {
        setShowTenderFolderModal(false);
        setTenderFolderNameInput('');
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Folder creation failed');
    } finally {
      setTenderFolderCreating(false);
    }
  };

  const handleDeleteFolder = async (id) => {
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    try {
      const res = await generalDocsAPI.deleteFolder(apiSec, id);
      if (res.success) {
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Folder deletion failed');
    }
  };

  const handleTenderUpload = async (e) => {
    e.preventDefault();
    if (!tenderUploadFile) {
      alert('Please select a file to upload');
      return;
    }
    if (!tenderUploadName) {
      alert('Please enter a document name');
      return;
    }
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    setTenderUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', tenderUploadName);
      formData.append('folder', selectedTenderFolderId || 'Root');
      formData.append('file', tenderUploadFile);

      const res = await generalDocsAPI.upload(apiSec, formData);
      if (res.success) {
        setShowTenderUploadModal(false);
        setTenderUploadName('');
        setTenderUploadFile(null);
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setTenderUploading(false);
    }
  };

  const handleDownloadSecureFile = async (downloadUrl, filename) => {
    try {
      const response = await api.get(downloadUrl, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file. Please check authorization or try again.');
    }
  };

  const handleDownloadGeneralDoc = (doc) => {
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;
    const url = generalDocsAPI.getDownloadUrl(apiSec, doc._id);
    handleDownloadSecureFile(url, doc.originalName || doc.name);
  };

  const handleViewDocument = async ({ title, filename, viewUrl, downloadUrl, mimeType }) => {
    setPreviewLoading(true);
    setShowPreviewModal(true);
    setPreviewTextContent('');
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewDoc({
      title,
      filename,
      viewUrl,
      downloadUrl,
      mimeType
    });

    try {
      const response = await api.get(viewUrl || downloadUrl, { responseType: 'blob' });
      const detectedType = mimeType || response.headers['content-type'] || '';
      const blob = new Blob([response.data], { type: detectedType });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);

      if (
        detectedType.includes('text') ||
        detectedType.includes('json') ||
        filename.toLowerCase().endsWith('.txt') ||
        filename.toLowerCase().endsWith('.csv') ||
        filename.toLowerCase().endsWith('.json') ||
        filename.toLowerCase().endsWith('.md')
      ) {
        const text = await blob.text();
        setPreviewTextContent(text);
      }
    } catch (err) {
      console.error('Failed to load file preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleViewGeneralDoc = (doc) => {
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;
    const viewUrl = generalDocsAPI.getViewUrl(apiSec, doc._id);
    const downloadUrl = generalDocsAPI.getDownloadUrl(apiSec, doc._id);
    handleViewDocument({
      title: doc.name,
      filename: doc.originalName || doc.name,
      viewUrl,
      downloadUrl,
      mimeType: doc.mimeType
    });
  };

  const handleViewRegisterDoc = (doc, version) => {
    const versionObj = version || doc.versions?.[doc.versions.length - 1];
    if (!versionObj) return;
    const viewUrl = documentsAPI.getViewUrl(versionObj._id);
    const downloadUrl = documentsAPI.getDownloadUrl(versionObj._id);
    handleViewDocument({
      title: `${doc.title} (Rev ${versionObj.revision})`,
      filename: versionObj.originalName || doc.title,
      viewUrl,
      downloadUrl,
      mimeType: versionObj.mimeType
    });
  };

  const handleDeleteDocument = async (id) => {
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    try {
      const res = await generalDocsAPI.deleteDocument(apiSec, id);
      if (res.success) {
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File deletion failed');
    }
  };

  const handleRenameDocument = async (e) => {
    e.preventDefault();
    if (!renameFileNameInput) {
      alert('Please enter a new name');
      return;
    }
    const apiSec = getApiSectionName(activeSection);
    if (!apiSec) return;

    setRenameFileSaving(true);
    try {
      const res = await generalDocsAPI.renameDocument(apiSec, renameFileId, renameFileNameInput);
      if (res.success) {
        setShowRenameModal(false);
        setRenameFileNameInput('');
        setRenameFileId(null);
        await fetchGeneralDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File rename failed');
    } finally {
      setRenameFileSaving(false);
    }
  };

  // Filter matrix elements based on search
  const filteredMatrix = matrixItems.filter(item =>
    item.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
    item.code.toLowerCase().includes(matrixSearch.toLowerCase())
  );

  // Filter document register based on search and status
  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.submittalMatrixId?.name.toLowerCase().includes(docSearch.toLowerCase());

    if (statusFilter === 'All') return matchSearch;
    if (statusFilter === 'Pending') return matchSearch && doc.status === 'Pending Engineer Review';
    if (statusFilter === 'Comments Issued') return matchSearch && doc.status === 'Engineer Reviewed - Comments Issued';
    if (statusFilter === 'Transmitted') return matchSearch && doc.status === 'Transmitted to Employer';
    if (statusFilter === 'Approved') return matchSearch && ['Employer Approved', 'Approved with Comments'].includes(doc.status);
    return matchSearch;
  });

  const getSubmittalCategory = (code) => {
    const num = parseInt(code?.replace('MMRCL-SUB-', '') || '0');
    if (num >= 1 && num <= 5) return 'Project Monitoring & Control';
    if (num === 8 || num === 9) return 'Project Monitoring & Control';
    if (num === 6 || num === 7 || num === 10) return 'Project Drawings';
    if (num === 11 || num === 19 || num === 20 || num === 21) return 'Project Documents & Registration';
    if (num === 12 || num === 13) return 'MEP';
    if (num >= 14 && num <= 16) return 'Quality Management';
    if (num === 17 || num === 18) return 'Environment, Health, and Safety (EHS)';
    if (num === 22) return 'Project Details';
    return 'Tender Documents';
  };

  const sectionMatrix = filteredMatrix.filter(item => getSubmittalCategory(item.code) === activeSection);
  const sectionDocs = filteredDocs.filter(doc => getSubmittalCategory(doc.submittalMatrixId?.code) === activeSection);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-sky-400">
        <RefreshCw className="h-10 w-10 animate-spin" />
        <span className="ml-3 font-semibold text-lg">Loading PMIS Services...</span>
      </div>
    );
  }

  // Print view override render
  if (showPrintReceipt && receiptDoc) {
    const latestVersion = receiptDoc.versions[receiptDoc.versions.length - 1];
    const expected = receiptDoc.submittalMatrixId.paperCopies;
    const received = latestVersion.hardCopiesReceived;

    return (
      <div className="p-8 max-w-3xl mx-auto bg-white text-black min-h-screen">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">MMRCL PMIS</h1>
            <p className="text-sm font-semibold text-slate-700">Project Management Information System</p>
            <p className="text-xs text-slate-500">In accordance with MMRCL/MB&SQ/VOL-3 PMIS Rule 14</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-800">TRANSMISSION RECEIPT</h2>
            <p className="text-xs font-semibold text-slate-500">Date: {new Date(latestVersion.uploadedAt).toLocaleDateString()}</p>
            <p className="text-xs font-semibold text-slate-500">Doc ID: {receiptDoc.documentNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-6 text-sm">
          <div>
            <h3 className="font-bold text-slate-800 uppercase mb-2">Origin (Contractor)</h3>
            <p><span className="font-semibold text-slate-600">Company:</span> L&T Construction MMRCL JV</p>
            <p><span className="font-semibold text-slate-600">Submitted By:</span> {receiptDoc.creator?.name}</p>
            <p><span className="font-semibold text-slate-600">Role:</span> Contractor</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 uppercase mb-2">Destination (Engineer Site Office)</h3>
            <p><span className="font-semibold text-slate-600">Site Authority:</span> MMRCL General Consultant</p>
            <p><span className="font-semibold text-slate-600">Verified By:</span> {latestVersion.hardCopiesVerifiedBy?.name || 'Pending Site Verification'}</p>
            <p><span className="font-semibold text-slate-600">Verification Status:</span> {latestVersion.hardCopiesVerifiedBy ? 'Verified & Registered' : 'Electronic Only'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-slate-800 uppercase mb-2 text-sm">Submittal Details</h3>
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border p-2">Submittal Type</th>
                <th className="border p-2">Document Title</th>
                <th className="border p-2">Revision</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">{receiptDoc.submittalMatrixId.name}</td>
                <td className="border p-2">{receiptDoc.title}</td>
                <td className="border p-2">Rev {receiptDoc.currentRevision}</td>
                <td className="border p-2 font-semibold text-sky-800">{receiptDoc.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-slate-800 uppercase mb-2 text-sm">PMIS Hard-Copy Handover Audit</h3>
          <p className="text-xs text-slate-500 mb-3">Verification of physical print counts as per the employer requirements submittal matrix:</p>

          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-center">
                <th className="border p-2 text-left">Paper Format</th>
                <th className="border p-2">Expected Matrix Count</th>
                <th className="border p-2">Actual Received Count</th>
                <th className="border p-2">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr>
                <td className="border p-2 text-left font-semibold">A1 Drawings</td>
                <td className="border p-2">{expected.A1}</td>
                <td className="border p-2">{received.A1}</td>
                <td className="border p-2 font-semibold">
                  {received.A1 >= expected.A1 ? (
                    <span className="text-green-600">✓ Met</span>
                  ) : (
                    <span className="text-amber-600">⚠ Short (-{expected.A1 - received.A1})</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 text-left font-semibold">A3 Drawings/Programs</td>
                <td className="border p-2">{expected.A3}</td>
                <td className="border p-2">{received.A3}</td>
                <td className="border p-2 font-semibold">
                  {received.A3 >= expected.A3 ? (
                    <span className="text-green-600">✓ Met</span>
                  ) : (
                    <span className="text-amber-600">⚠ Short (-{expected.A3 - received.A3})</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 text-left font-semibold">A4 Documents/Reports</td>
                <td className="border p-2">{expected.A4}</td>
                <td className="border p-2">{received.A4}</td>
                <td className="border p-2 font-semibold">
                  {received.A4 >= expected.A4 ? (
                    <span className="text-green-600">✓ Met</span>
                  ) : (
                    <span className="text-amber-600">⚠ Short (-{expected.A4 - received.A4})</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-slate-800 uppercase mb-1 text-sm font-semibold">Verification Audit Logs</h3>
          <p className="text-xs text-slate-700 italic border-l-4 border-slate-800 pl-3 py-2 bg-slate-50">
            "We hereby certify that the electronic capture at point of origin has been synchronized with this physical print handover ledger."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 mt-12 pt-8 text-center text-sm border-t">
          <div>
            <div className="h-16"></div>
            <div className="border-t border-dashed border-slate-500 pt-2 font-semibold">Contractor Representative Signature</div>
            <div className="text-xs text-slate-500">{receiptDoc.creator?.name}</div>
          </div>
          <div>
            <div className="h-16"></div>
            <div className="border-t border-dashed border-slate-500 pt-2 font-semibold">GC Resident Engineer / Inspector Signature</div>
            <div className="text-xs text-slate-500">{latestVersion.hardCopiesVerifiedBy?.name || 'Not yet signed'}</div>
          </div>
        </div>

        <div className="mt-16 no-print flex justify-end space-x-3 bg-slate-900 p-4 rounded-xl text-white">
          <button
            onClick={() => setShowPrintReceipt(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-sm font-semibold rounded-lg flex items-center transition"
          >
            <Printer className="mr-2 h-4 w-4" /> Print Handover Receipt
          </button>
        </div>
      </div>
    );
  }

  // Guest Link Secure Viewer Render
  if (guestMode) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-8 glass-panel p-8 rounded-2xl border border-slate-200 bg-white shadow-md">
          <div>
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-sky-600 animate-pulse-subtle" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
              MMRCL PMIS Secure Link
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Electronic Document Transmission Portal
            </p>
          </div>

          {guestError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
              <span>{guestError}</span>
            </div>
          )}

          {!guestShareData ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-sky-600" />
              <p className="mt-2 text-sm">Validating secure sharing token...</p>
            </div>
          ) : (
            <div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 mb-6 border border-slate-200 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Document Type</span>
                  <span className="font-semibold text-slate-800">{guestShareData.documentTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-xs">Drawing / Doc ID</span>
                    <span className="font-semibold text-slate-800">{guestShareData.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Active Version</span>
                    <span className="font-semibold text-slate-800">Rev {guestShareData.revision}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-xs">Shared By</span>
                    <span className="font-medium text-slate-800">{guestShareData.createdBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Originating Office</span>
                    <span className="font-medium text-slate-800">{guestShareData.createdFrom}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-xs">Link Expires At</span>
                  <span className="font-semibold text-amber-600">{new Date(guestShareData.expiresAt).toLocaleString()}</span>
                </div>
              </div>

              {!guestDocData ? (
                <form onSubmit={handleAccessGuestLink} className="space-y-4">
                  {guestShareData.passcodeRequired ? (
                    <div>
                      <label htmlFor="passcode" className="block text-sm font-medium text-slate-600">
                        Enter Security Passcode
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="password"
                          name="passcode"
                          id="passcode"
                          required
                          value={guestPasscode}
                          onChange={(e) => setGuestPasscode(e.target.value)}
                          className="pl-10 block w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm py-2.5 focus:bg-white transition"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-green-700 mb-4 bg-green-50 p-2 border border-green-150 rounded">
                      No password protection required. You can access the documents directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-sky-655 bg-sky-600 hover:bg-sky-700 transition flex justify-center items-center shadow-sm"
                  >
                    Authenticate Link
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-700">
                    <p className="font-semibold">Authentication Successful</p>
                    <p className="text-xs">Document metadata and stream tokens unlocked.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="text-slate-500 block text-xs">Unlocked File</span>
                    <p className="font-semibold text-sm text-slate-850 truncate">{guestDocData.version.originalName}</p>
                    <p className="text-xs text-slate-450 text-slate-500">Size: {(guestDocData.version.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                    <p className="text-xs text-slate-450 text-slate-500">Review Status: <span className="font-semibold text-sky-600">{guestDocData.version.reviewStatus}</span></p>
                  </div>

                  <a
                    href={shareAPI.getSharedDownloadUrl(guestToken, guestPasscode)}
                    download
                    className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex justify-center items-center shadow-sm"
                  >
                    <Download className="mr-2 h-5 w-5" /> Download Document File
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => {
                setGuestMode(false);
                window.history.pushState({}, document.title, window.location.pathname);
              }}
              className="text-xs text-slate-555 text-slate-500 hover:text-slate-700 transition underline"
            >
              Go to Portal Login
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400">
          MMRCL Vol-3 Employer's Requirements PMIS Rule 14 Handover. Secure End-to-End Encryption.
        </div>
      </div>
    );
  }

  // Portal Login Form Render (if no user logged in)
  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 select-none">
        {/* Building Background Image (Full Clarity & Visibility) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 scale-105"
          style={{ backgroundImage: `url('/uploads/metro_bhawan.jpg')` }}
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-900/10 to-slate-950/30" />

        {/* Light Glassmorphism Translucent Container (Building Photo Visible Behind Glass) */}
        <div className="relative z-10 max-w-xl md:max-w-2xl w-full space-y-6 p-8 md:p-10 rounded-3xl border border-white/80 bg-white/45 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] text-slate-900">
          <div className="flex justify-between items-center space-x-4">
            {/* Left Logo (MMRCL) */}
            <div className="flex-shrink-0 bg-white/80 p-2 rounded-2xl shadow-md border border-white/70 flex items-center justify-center overflow-hidden backdrop-blur-md">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjlVqe7__mbukSAqD0yG5U1pc4OCG8P-uLO3GPA7JZRA&s=10"
                alt="MMRCL Logo"
                className="h-14 w-14 object-contain rounded-xl"
              />
            </div>

            {/* Middle Title & Subtitle */}
            <div className="flex-1 text-center px-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-wide">
                MMRCL NECPL PMIS Portal
              </h2>
              <p className="mt-1 text-xs text-slate-900 leading-relaxed font-bold uppercase tracking-tight">
                Construction Of Metro Bhawan & Staff Quarters For Mumbai Metro Rail Corporation Limited In Mumbai
              </p>
            </div>

            {/* Right Logo (NYATI) */}
            <div className="flex-shrink-0 bg-white/80 p-2 rounded-2xl shadow-md border border-white/70 flex items-center justify-center overflow-hidden backdrop-blur-md">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAGavyGhFQr76WetCwQPPqyKRjiAKfgJFBiNxZlNlzO_J75_6Un9uDyaI&s=10"
                alt="Nyati Group Logo"
                className="h-14 w-14 object-contain rounded-xl"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50/90 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center shadow-sm backdrop-blur-md">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-2.5 bg-white/60 border border-white/80 placeholder-slate-500 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white/90 text-sm transition shadow-sm backdrop-blur-md"
                  placeholder="Enter User ID (e.g. NECPL, MMRCL, PMC)"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-xs font-bold text-sky-800 hover:text-sky-950 transition underline underline-offset-2"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="appearance-none block w-full pl-4 pr-10 py-2.5 bg-white/60 border border-white/80 placeholder-slate-500 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white/90 text-sm transition shadow-sm backdrop-blur-md"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CAPTCHA SECTION */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Captcha Verification</span>
                  <span className="text-[10px] text-slate-600 font-semibold uppercase">Case-insensitive</span>
                </label>
                <div className="flex items-center space-x-3">
                  {/* Styled Captcha Display Box */}
                  <div className="relative flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-white/60 rounded-xl shadow-inner select-none overflow-hidden min-w-[140px] backdrop-blur-md">
                    {/* Background Noise SVG Lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="12" x2="100%" y2="28" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="0" y1="32" x2="100%" y2="14" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="15%" y1="0" x2="85%" y2="100%" stroke="#10b981" strokeWidth="1" />
                    </svg>

                    {/* Captcha Text */}
                    <div className="relative z-10 font-mono text-lg font-black tracking-widest text-slate-100 italic select-none pl-1" style={{ letterSpacing: '0.22em', textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                      <span className="inline-block transform -skew-x-6 text-sky-400">{captchaCode.slice(0, 2)}</span>
                      <span className="inline-block transform skew-x-3 text-amber-300">{captchaCode.slice(2, 4)}</span>
                      <span className="inline-block transform -skew-x-3 text-emerald-400">{captchaCode.slice(4, 6)}</span>
                    </div>

                    {/* Refresh Button */}
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="relative z-10 ml-2 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition duration-150 active:rotate-180"
                      title="Refresh CAPTCHA"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Captcha Input Field */}
                  <input
                    type="text"
                    required
                    name="captchaInput"
                    autoComplete="off"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 bg-white/60 border border-white/80 placeholder-slate-500 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white/90 text-sm font-bold tracking-wider transition shadow-sm backdrop-blur-md"
                    placeholder="Enter Code"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.99] transition duration-150 flex justify-center items-center shadow-md shadow-sky-600/20"
              >
                Sign In
              </button>
            </div>
          </form>

        </div>

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
            <div className="relative w-full max-w-md p-6 md:p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl text-slate-900">
              {/* Header */}
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-5">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Reset Account Password
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    MMRCL NECPL PMIS Credential Recovery
                  </p>
                </div>
              </div>

              {forgotSubmitted ? (
                <div className="space-y-4 text-center py-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full animate-bounce">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Password Reset Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
                    Your password has been updated for User ID <strong className="text-slate-900">{forgotUserId}</strong>. You can now sign in using your new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition shadow-md"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  {forgotErrorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center shadow-sm">
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-rose-600" />
                      <span>{forgotErrorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      User ID / Registered Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={forgotUserId}
                        onChange={(e) => setForgotUserId(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold transition"
                        placeholder="Enter User ID (e.g. NECPL, MMRCL)"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold transition"
                        placeholder="Enter new password"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-semibold transition"
                        placeholder="Re-enter new password"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA SECTION FOR RESET */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>Captcha Verification</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Case-insensitive</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl shadow-inner select-none overflow-hidden min-w-[130px]">
                        <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="12" x2="100%" y2="28" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 2" />
                          <line x1="0" y1="32" x2="100%" y2="14" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                        <div className="relative z-10 font-mono text-base font-black tracking-widest text-slate-100 italic select-none pl-1" style={{ letterSpacing: '0.22em' }}>
                          <span className="inline-block transform -skew-x-6 text-sky-400">{forgotCaptchaCode.slice(0, 2)}</span>
                          <span className="inline-block transform skew-x-3 text-amber-300">{forgotCaptchaCode.slice(2, 4)}</span>
                          <span className="inline-block transform -skew-x-3 text-emerald-400">{forgotCaptchaCode.slice(4, 6)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={generateForgotCaptcha}
                          className="relative z-10 ml-2 p-1 text-slate-400 hover:text-white rounded-lg transition"
                          title="Refresh CAPTCHA"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        name="forgotCaptchaInput"
                        autoComplete="off"
                        value={forgotCaptchaInput}
                        onChange={(e) => setForgotCaptchaInput(e.target.value)}
                        className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold tracking-wider transition"
                        placeholder="Enter Code"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-1/2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition flex justify-center items-center shadow-md shadow-sky-600/20"
                    >
                      {forgotLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const sidebarSections = [
    { id: 'details', name: 'Project Details', icon: Building },
    { id: 'tender', name: 'Tender Documents', icon: FileText },
    { id: 'contractual', name: 'Contractual', icon: FileCheck },
    { id: 'monitor', name: 'Project Monitoring & Control', icon: BarChart3 },
    { id: 'drawing', name: 'Project Drawings', icon: Compass },
    { id: 'quality', name: 'Quality Management', icon: Award },
    { id: 'ehs', name: 'Environment, Health, and Safety (EHS)', icon: ShieldAlert },
    { id: 'mep', name: 'MEP', icon: Wrench },
    { id: 'registrations', name: 'Project Documents & Registration', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-slate-800 font-sans">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 sticky top-0 h-screen z-30 select-none flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2 py-1.5 border-b border-slate-100 pb-4">
            <div className="flex-shrink-0 bg-gradient-to-br from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-md text-white flex items-center justify-center">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
                Project Management Information System (PMIS)
              </h1>
            </div>
          </div>

          <nav className="space-y-1.5">
            {sidebarSections.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSection === sec.name;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.name)}
                  className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold tracking-wide transition-all duration-200 relative group ${isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 border border-transparent'
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r bg-sky-500"></span>
                  )}
                  <IconComp className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 mt-0.5 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-555'
                    }`} />
                  <span className="whitespace-normal break-words pr-2">{sec.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="bg-gradient-to-tr from-sky-500 to-teal-400 h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0">
              {(currentUser.name ? currentUser.name.split(' (')[0] : currentUser.userId || 'User').charAt(0)}
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-slate-900 leading-tight whitespace-normal break-words">
                {currentUser.name ? currentUser.name.split(' (')[0] : currentUser.userId || 'User'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">


        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeSection === 'Project Details' ? (
            <div className="space-y-6 w-full max-w-[99%] mx-auto animate-fade-in text-slate-700">
              {/* Header Title Banner with Partner Logos */}
              <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-x-6">
                {/* Left Logo (MMRCL) */}
                <div className="flex-shrink-0">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjlVqe7__mbukSAqD0yG5U1pc4OCG8P-uLO3GPA7JZRA&s=10"
                    alt="MMRCL Logo"
                    className="h-20 w-auto object-contain"
                  />
                </div>
                {/* Centered Project Name */}
                <div className="flex-1 text-center">
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-wide uppercase leading-snug">
                    Construction Of Metro Bhawan & Staff Quarters For Mumbai Metro Rail Corporation Limited In Mumbai
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">
                    Project Management & Monitoring Portal
                  </p>
                </div>
                {/* Right Logo (NYATI) */}
                <div className="flex-shrink-0">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAGavyGhFQr76WetCwQPPqyKRjiAKfgJFBiNxZlNlzO_J75_6Un9uDyaI&s=10"
                    alt="Nyati Group Logo"
                    className="h-20 w-auto object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Building Rendering Hero Banner (Full height image display with centered max-width) */}
              <div className="flex justify-center">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm max-w-4xl md:max-w-5xl w-full p-2 flex justify-center">
                  <img
                    src="/uploads/metro_bhawan.jpg"
                    alt="Metro Bhawan Building Architectural Rendering"
                    className="w-full h-auto rounded-xl object-contain hover:scale-[1.005] transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://projectmanagement.nyatigroup.com:5005/uploads/metro_bhawan.jpg'; }}
                  />
                </div>
              </div>

              {/* Grid 1: Basic & Stakeholders & Financials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic specs */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-sky-655 text-sky-600" /> Contract Specifications
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Tender ID:</span>
                      <span className="font-bold text-slate-800 select-all font-mono">2026_MMRCL_269728_1</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Contract Type:</span>
                      <span className="font-semibold text-slate-800">"B-1" (Item Rate)</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Project Cost:</span>
                      <span className="font-bold text-sky-700">₹ 431.65 Cr. (Excl. GST)</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Completion Time:</span>
                      <span className="font-semibold text-slate-800">30 Months (Incl. Monsoon)</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Built-Up Area:</span>
                      <span className="font-semibold text-slate-800">6,15,862.26 Sft</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-800 font-semibold">Tender Submission:</span>
                      <span className="font-semibold text-slate-800">22-04-2026 16:00</span>
                    </div>
                  </div>
                </div>

                {/* Stakeholders */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-teal-600" /> Project Stakeholders
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-800 font-semibold">Client:</span>
                      <span className="font-semibold text-slate-800 text-right">Mumbai Metro Rail Corporation Ltd.</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-800 font-semibold">Architect:</span>
                      <span className="font-semibold text-slate-800 text-right">Shashi Prabhu & Associates</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-800 font-semibold">PMC:</span>
                      <span className="font-semibold text-slate-800 text-right">FP Project Management</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-800 font-semibold">Structural Consultant:</span>
                      <span className="font-semibold text-slate-800 text-right">EPICONS</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-800 font-semibold">MEP Consultant:</span>
                      <span className="font-semibold text-slate-800 text-right">Shashi Prabhu & Associates</span>
                    </div>
                  </div>
                </div>

                {/* Financial and BG */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-indigo-600" /> BG & Price Escalation
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block text-xs mb-1">Performance BG Terms</span>
                      <p className="text-slate-600 leading-normal">
                        Submitted within 30 days of LOA. <strong>5% of accepted Contract Price</strong> in form of BG, DD, FDR, ISB. Valid up to 6 months beyond DLP.
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block text-xs mb-1">Price Escalation (Civil)</span>
                      <p className="text-slate-600 leading-normal">
                        As per Variation Formula from date 30 days before tender receipt:
                      </p>
                      <div className="grid grid-cols-3 gap-1 text-center font-bold mt-1 text-xs">
                        <div className="bg-slate-50 p-1 rounded border border-slate-100 text-slate-700">Labour: 30%</div>
                        <div className="bg-slate-50 p-1 rounded border border-slate-100 text-slate-700">Material: 65%</div>
                        <div className="bg-slate-50 p-1 rounded border border-slate-100 text-slate-700">POL: 5%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Scope of Work Title */}
              <div className="border-b border-slate-200 pt-4 pb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-sky-600" /> Detailed Scope of Work & Architectural Layouts
                </h4>
              </div>

              {/* Grid 2: Scope of Work A, B, C */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metro Bhawan */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">A). Metro Bhawan</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded">Commercial</span>
                  </div>
                  <ul className="space-y-2 text-xs list-disc pl-4 text-slate-800 leading-relaxed">
                    <li>Total construction area: <strong>2,86,817.54 Sft</strong></li>
                    <li>No of floors: <strong>2B + G + 8</strong> (height 4.2 m each)</li>
                    <li>Building Height: <strong>38.55 m</strong></li>
                    <li>Equipped with a <strong>200 Capacity Auditorium</strong></li>
                    <li>Mechanized stack parking for <strong>182 cars (91x2)</strong></li>
                  </ul>
                </div>

                {/* Executive Staff Quarters */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">B). Executive Staff Quarters</span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded">Residential</span>
                  </div>
                  <ul className="space-y-2 text-xs list-disc pl-4 text-slate-800 leading-relaxed">
                    <li>
                      Built-up Area:
                      <span className="block pl-2 text-xs font-semibold text-slate-800">
                        Tower-A = 62,711.06 Sft<br />
                        Tower-B = 76,004.60 Sft<br />
                        Tower-C = 1,18,134.90 Sft
                      </span>
                    </li>
                    <li>Floor heights: <strong>Tower A (G+12)</strong>, <strong>Tower B (G+12)</strong>, <strong>Tower C (G+8)</strong></li>
                    <li>Building Height: <strong>Tower A, B, C = 42.60 m</strong></li>
                    <li>Clubhouse <strong>G+2</strong> & Central play court (height = 8 m)</li>
                    <li>Mechanized stack parking for <strong>30 cars (15x2)</strong></li>
                  </ul>
                </div>

                {/* Non-Executive Staff Quarters */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">C). Non-Executive Staff Quarters</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded">Dharavi site</span>
                  </div>
                  <ul className="space-y-2 text-xs list-disc pl-4 text-slate-800 leading-relaxed">
                    <li>Total construction area: <strong>72,194.14 Sft</strong></li>
                    <li>No of floors: <strong>G + 22</strong></li>
                    <li>Building Height: <strong>69.6 m</strong></li>
                    <li>Mechanized puzzle car parking (<strong>25 cars</strong>)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : generalDocSections.includes(activeSection) ? (
            <div className="space-y-6 w-full max-w-[99%] mx-auto animate-fade-in text-slate-700 relative">
              {(activeFolderMenuId || activeFileMenuId) && (
                <div
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => {
                    setActiveFolderMenuId(null);
                    setActiveFileMenuId(null);
                  }}
                />
              )}
              <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3">
                  {folderPath.length > 0 && (
                    <button
                      onClick={() => setFolderPath(prev => prev.slice(0, -1))}
                      className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl transition shadow-sm flex items-center justify-center cursor-pointer group"
                      title="Go Back to Previous Folder"
                    >
                      <ChevronLeft className="h-6 w-6 stroke-[3] text-orange-600 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">{activeSection} Ledger</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Browse and manage packages, files, and documents for {activeSection}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTenderFolderModal(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center transition shadow-sm"
                  >
                    <Folder className="mr-1.5 h-4 w-4 fill-current text-white" /> Create Folder
                  </button>
                  <button
                    onClick={() => setShowTenderUploadModal(true)}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs flex items-center transition shadow-sm"
                  >
                    <UploadCloud className="mr-1.5 h-4 w-4" /> Upload File
                  </button>
                </div>
              </div>

              {tenderLoading ? (
                <div className="flex justify-center items-center py-20 text-sky-600">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-3 font-semibold text-sm">Loading folder contents...</span>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Folders Grid and Files Table at current path level */}
                  {(() => {
                    const currentFolders = tenderFolders.filter(f => f.parentFolder === selectedTenderFolderId);
                    const targetFolderRef = selectedTenderFolderId || 'Root';
                    const currentFiles = tenderDocs.filter(d => d.folder === targetFolderRef || (selectedTenderFolder && d.folder === selectedTenderFolder));
                    const isFullRights = currentUser && (
                      currentUser.role === 'Site Engineer' ||
                      (currentUser.userId && currentUser.userId.toUpperCase() === 'NECPL') ||
                      (currentUser.email && currentUser.email.toLowerCase().includes('necpl')) ||
                      (currentUser.name && currentUser.name.toUpperCase().includes('NECPL'))
                    );

                    if (currentFolders.length === 0 && currentFiles.length === 0) {
                      return (
                        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 font-semibold italic text-sm">
                          This folder is empty. Create a folder or upload a file to begin!
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6">
                        {/* Folders Grid */}
                        {currentFolders.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            {currentFolders.map(folder => {
                              const folderName = folder.name;
                              const count = tenderDocs.filter(d => d.folder === folder._id || d.folder === folderName).length;
                              return (
                                <div
                                  key={folder._id}
                                  onClick={() => setFolderPath(prev => [...prev, folder])}
                                  className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 hover:shadow-md cursor-pointer transition duration-200 flex items-start justify-between shadow-sm group relative z-20"
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-100 transition flex-shrink-0">
                                      <Folder className="h-8 w-8 fill-current" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                      <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition whitespace-normal break-words leading-tight" title={folderName}>{folderName}</h4>
                                      <p className="text-xs text-slate-500 font-semibold">{count} {count === 1 ? 'document' : 'documents'} inside</p>
                                    </div>
                                  </div>

                                  {/* Three dots option menu (NECPL / Admin Only for folder delete) */}
                                  {isFullRights && (
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveFolderMenuId(activeFolderMenuId === folder._id ? null : folder._id);
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                                      >
                                        <MoreVertical className="h-5 w-5" />
                                      </button>

                                      {/* Dropdown Menu */}
                                      {activeFolderMenuId === folder._id && (
                                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-32 z-20 animate-fade-in text-xs">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm(`Are you sure you want to delete the folder "${folderName}" and all of its files?`)) {
                                                handleDeleteFolder(folder._id);
                                              }
                                              setActiveFolderMenuId(null);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold transition"
                                          >
                                            Delete Folder
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Files Table */}
                        {currentFiles.length > 0 && (
                          <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {selectedTenderFolder ? `Files inside "${selectedTenderFolder}"` : 'Files (At Root)'}
                              </span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm min-h-[220px] pb-12">
                              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                                  <tr>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap">Document Title</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap">File Info</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap">Uploaded By</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap">Upload Date</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap text-center">Remark</th>
                                    <th scope="col" className="px-6 py-4 whitespace-nowrap text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {currentFiles.map((doc, docIndex) => (
                                    <tr key={doc._id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-6 py-4 font-semibold text-slate-800 flex items-center space-x-3 min-w-0">
                                        <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <button
                                            onClick={() => handleViewGeneralDoc(doc)}
                                            className="text-left font-semibold text-xs text-slate-900 hover:text-sky-600 transition cursor-pointer whitespace-nowrap truncate block max-w-sm md:max-w-md"
                                            title={doc.name}
                                          >
                                            {doc.name}
                                          </button>
                                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5 whitespace-nowrap truncate max-w-sm md:max-w-md" title={doc.originalName}>{doc.originalName}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                        <span className="font-semibold block text-xs">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[140px]">{doc.mimeType}</span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold block text-slate-700 text-xs">
                                          {doc.uploadedBy?.name && doc.uploadedBy.name !== 'System Seeded' ? doc.uploadedBy.name : 'NECPL'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-slate-600 text-xs font-medium whitespace-nowrap">
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {(() => {
                                          const remarkList = doc.remarks && doc.remarks.length > 0
                                            ? doc.remarks
                                            : (doc.remark ? [{ text: doc.remark, userName: doc.uploadedBy?.name || 'User', createdAt: doc.uploadedAt }] : []);
                                          const msgCount = remarkList.length;

                                          return (
                                            <button
                                              onClick={() => handleOpenRemarkModal(doc)}
                                              className={`inline-flex items-center px-3 py-1.5 rounded-xl border transition shadow-sm font-semibold text-xs cursor-pointer relative group ${msgCount > 0
                                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                                                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                                }`}
                                              title={msgCount > 0 ? `Latest remark: "${remarkList[remarkList.length - 1].text}"` : 'Add Remark'}
                                            >
                                              {msgCount > 0 ? (
                                                <>
                                                  <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                                                  <span>Remarks</span>
                                                  <span className="ml-2 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold min-w-[18px] text-center shadow-sm">
                                                    {msgCount}
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                                  <span>Remark</span>
                                                </>
                                              )}
                                            </button>
                                          );
                                        })()}
                                      </td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end space-x-2">
                                          <button
                                            onClick={() => handleDownloadGeneralDoc(doc)}
                                            className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-sm font-semibold text-xs"
                                            title="Download File"
                                          >
                                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                                          </button>

                                          {/* Rename & Delete options menu */}
                                          <div className="relative inline-block text-left">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveFileMenuId(activeFileMenuId === doc._id ? null : doc._id);
                                              }}
                                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                                            >
                                              <MoreVertical className="h-4 w-4" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeFileMenuId === doc._id && (
                                              <div className={`absolute right-0 ${docIndex < 2 ? 'top-full mt-1' : 'bottom-full mb-1'} bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-32 z-30 animate-fade-in text-left text-xs`}>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRenameFileId(doc._id);
                                                    setRenameFileNameInput(doc.name);
                                                    setShowRenameModal(true);
                                                    setActiveFileMenuId(null);
                                                  }}
                                                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-semibold transition flex items-center"
                                                >
                                                  Rename
                                                </button>
                                                {isFullRights && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (window.confirm(`Are you sure you want to delete the file "${doc.name}"?`)) {
                                                        handleDeleteDocument(doc._id);
                                                      }
                                                      setActiveFileMenuId(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold transition flex items-center"
                                                  >
                                                    Delete
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`pb-3 px-6 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${activeTab === 'matrix' ? 'border-sky-500 text-sky-655 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Submittal Matrix ({sectionMatrix.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`pb-3 px-6 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${activeTab === 'documents' ? 'border-sky-500 text-sky-655 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Documents Register ({sectionDocs.length})</span>
                </button>
              </div>

              {/* Matrix List Tab */}
              {activeTab === 'matrix' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative w-80">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Filter Matrix by Code or Name..."
                        value={matrixSearch}
                        onChange={(e) => setMatrixSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 block w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs focus:bg-white"
                      />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Showing {sectionMatrix.length} requirements under {activeSection}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-4 border-r border-slate-100 w-28">Code</th>
                          <th scope="col" className="px-6 py-4 border-r border-slate-100">MMRCL Submittal Description</th>
                          <th scope="col" className="px-6 py-4 text-center border-r border-slate-100" colSpan="3">Expected Paper Copies</th>
                          <th scope="col" className="px-6 py-4 text-center border-r border-slate-100">Expected Electronic</th>
                          <th scope="col" className="px-6 py-4 text-center border-r border-slate-100">Upload Progress</th>
                          {currentUser.role !== 'Contractor' && (
                            <th scope="col" className="px-6 py-4 text-right">Action</th>
                          )}
                        </tr>
                        <tr className="bg-slate-50/50 text-xs text-center border-t border-slate-100">
                          <td className="border-r border-slate-100"></td>
                          <td className="border-r border-slate-100"></td>
                          <td className="py-2 border-r border-slate-100 font-bold text-slate-500">A1</td>
                          <td className="py-2 border-r border-slate-100 font-bold text-slate-500">A3</td>
                          <td className="py-2 border-r border-slate-100 font-bold text-slate-500">A4</td>
                          <td className="border-r border-slate-100"></td>
                          <td className="border-r border-slate-100"></td>
                          {currentUser.role !== 'Contractor' && <td></td>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sectionMatrix.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold italic text-sm">
                              No requirements found for this section.
                            </td>
                          </tr>
                        ) : (
                          sectionMatrix.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-3.5 font-bold text-slate-600 border-r border-slate-100 text-sm">
                                {item.code}
                              </td>
                              <td className="px-6 py-3.5 font-bold text-slate-800 border-r border-slate-100 text-sm">
                                {item.name}
                                {item.reference && (
                                  <span className="block text-xs text-slate-400 mt-0.5 italic font-normal">
                                    Ref: {item.reference}
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-3.5 text-center text-slate-700 border-r border-slate-100 text-sm font-semibold">
                                {item.paperCopies.A1 > 0 ? item.paperCopies.A1 : '-'}
                              </td>
                              <td className="px-2 py-3.5 text-center text-slate-700 border-r border-slate-100 text-sm font-semibold">
                                {item.paperCopies.A3 > 0 ? item.paperCopies.A3 : '-'}
                              </td>
                              <td className="px-2 py-3.5 text-center text-slate-700 border-r border-slate-100 text-sm font-semibold">
                                {item.paperCopies.A4 > 0 ? item.paperCopies.A4 : '-'}
                              </td>
                              <td className="px-6 py-3.5 text-center text-slate-700 border-r border-slate-100 font-bold text-sm">
                                {item.electronicCopies > 0 ? item.electronicCopies : 'None'}
                              </td>
                              <td className="px-6 py-3.5 text-center border-r border-slate-100">
                                {item.stats?.total > 0 ? (
                                  <div className="flex flex-col items-center">
                                    <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-sky-50 text-sky-700 border border-sky-100 mb-1">
                                      {item.stats.total} Uploaded
                                    </span>
                                    <div className="flex space-x-1.5">
                                      {item.stats.approved > 0 && (
                                        <span className="text-xs text-green-600 font-bold">{item.stats.approved} Appr</span>
                                      )}
                                      {item.stats.pending > 0 && (
                                        <span className="text-xs text-amber-600 font-bold">{item.stats.pending} Pend</span>
                                      )}
                                      {item.stats.commentsIssued > 0 && (
                                        <span className="text-xs text-rose-600 font-bold">{item.stats.commentsIssued} Comm</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-semibold italic text-xs">No Submissions</span>
                                )}
                              </td>
                              {currentUser.role !== 'Contractor' && (
                                <td className="px-6 py-3.5 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedMatrixItem(item);
                                      setShowUploadModal(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white transition font-bold rounded-lg flex items-center ml-auto text-xs shadow-sm"
                                  >
                                    <UploadCloud className="mr-1.5 h-4 w-4" /> Upload File
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Documents Register Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4 flex-wrap">
                    <div className="relative flex-1 max-w-sm">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search by Title, Doc #, or Matrix..."
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 block w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 space-x-1">
                        {['All', 'Pending', 'Comments Issued', 'Transmitted', 'Approved'].map(statusName => (
                          <button
                            key={statusName}
                            onClick={() => setStatusFilter(statusName)}
                            className={`px-2.5 py-1 rounded transition font-semibold ${statusFilter === statusName ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            {statusName}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th scope="col" className="px-6 py-4">Doc ID / Title</th>
                          <th scope="col" className="px-6 py-4">Matrix Requirement</th>
                          <th scope="col" className="px-6 py-4 text-center">Current Revision</th>
                          <th scope="col" className="px-6 py-4 text-center">Transmission Status</th>
                          <th scope="col" className="px-6 py-4 text-center">Paper Audit</th>
                          <th scope="col" className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sectionDocs.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold italic text-sm">
                              No document packages matched the filters for this section.
                            </td>
                          </tr>
                        ) : (
                          sectionDocs.map((doc) => {
                            const latestVersion = doc.versions[doc.versions.length - 1];
                            const expectedPaper = doc.submittalMatrixId?.paperCopies || { A1: 0, A3: 0, A4: 0 };
                            const receivedPaper = latestVersion?.hardCopiesReceived || { A1: 0, A3: 0, A4: 0 };

                            const paperMet =
                              receivedPaper.A1 >= expectedPaper.A1 &&
                              receivedPaper.A3 >= expectedPaper.A3 &&
                              receivedPaper.A4 >= expectedPaper.A4;

                            let statusBadge = '';
                            if (doc.status === 'Pending Engineer Review') {
                              statusBadge = 'bg-amber-50 text-amber-600 border-amber-200';
                            } else if (doc.status === 'Engineer Reviewed - Comments Issued') {
                              statusBadge = 'bg-rose-50 text-rose-600 border-rose-200';
                            } else if (doc.status === 'Transmitted to Employer') {
                              statusBadge = 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse';
                            } else if (['Employer Approved', 'Approved with Comments'].includes(doc.status)) {
                              statusBadge = 'bg-emerald-50 text-emerald-650 text-emerald-600 border-emerald-200';
                            } else {
                              statusBadge = 'bg-slate-100 text-slate-655 text-slate-500 border-slate-200';
                            }

                            return (
                              <tr key={doc._id} className="hover:bg-slate-50/50 transition align-top">
                                <td className="px-6 py-4 max-w-xs">
                                  <span className="font-bold text-slate-900 block text-sm tracking-tight">{doc.documentNumber}</span>
                                  {latestVersion ? (
                                    <button
                                      onClick={() => handleViewRegisterDoc(doc, latestVersion)}
                                      className="text-slate-800 hover:text-sky-600 font-semibold block text-xs mt-0.5 text-left transition cursor-pointer whitespace-normal break-all break-words leading-snug max-w-xs"
                                      title="Click to view document"
                                    >
                                      {doc.title}
                                    </button>
                                  ) : (
                                    <span className="text-slate-700 block text-xs mt-0.5 whitespace-normal break-all break-words leading-snug max-w-xs">{doc.title}</span>
                                  )}
                                  <span className="text-xs text-slate-400 block mt-1">
                                    Uploaded {new Date(latestVersion?.uploadedAt).toLocaleDateString()} by {doc.creator?.name}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="block font-semibold text-slate-800 text-sm">{doc.submittalMatrixId?.code}</span>
                                  <span className="block text-xs text-slate-500 line-clamp-1">{doc.submittalMatrixId?.name}</span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-slate-800 text-sm">
                                  Rev {doc.currentRevision}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] border ${statusBadge}`}>
                                    {doc.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {expectedPaper.A1 === 0 && expectedPaper.A3 === 0 && expectedPaper.A4 === 0 ? (
                                    <span className="text-slate-400 italic">Not Required</span>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${paperMet ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                        {paperMet ? 'Verified Complete' : 'Incomplete Print'}
                                      </span>
                                      <span className="text-[10px] text-slate-400 mt-1 font-medium">
                                        A1: {receivedPaper.A1}/{expectedPaper.A1} | A3: {receivedPaper.A3}/{expectedPaper.A3} | A4: {receivedPaper.A4}/{expectedPaper.A4}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right space-y-1.5">
                                  <div className="flex justify-end space-x-1.5">
                                    {latestVersion && (
                                      <button
                                        onClick={() => handleDownloadSecureFile(documentsAPI.getDownloadUrl(latestVersion._id), latestVersion.originalName || doc.title)}
                                        className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition shadow-sm flex items-center justify-center"
                                        title="Download File"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openHistoryModal(doc)}
                                      className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition shadow-sm flex items-center justify-center"
                                      title="Audit Timeline History"
                                    >
                                      <History className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openPrintReceipt(doc)}
                                      className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition shadow-sm flex items-center justify-center"
                                      title="Print Handover Record / PDF"
                                    >
                                      <Printer className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex justify-end flex-wrap gap-1 pt-1.5">
                                    {currentUser.role === 'Contractor' && doc.status === 'Engineer Reviewed - Comments Issued' && (
                                      <button
                                        onClick={() => setSelectedDocForRevision(doc)}
                                        className="px-2 py-1 bg-sky-600 text-white hover:bg-sky-700 rounded text-[10px] font-bold transition flex items-center"
                                      >
                                        <UploadCloud className="mr-1 h-3 w-3" /> Re-Submit
                                      </button>
                                    )}

                                    {currentUser.role === 'Site Engineer' && (
                                      <>
                                        {doc.status === 'Pending Engineer Review' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setSelectedDocForReview(doc);
                                                setReviewStatus('Approved');
                                                setShowReviewModal(true);
                                              }}
                                              className="px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-[10px] font-bold transition"
                                            >
                                              Review
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedDocForTransmit(doc);
                                                setTransmitToRole("Employer's Office");
                                                setShowTransmitModal(true);
                                              }}
                                              className="px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-[10px] font-bold transition"
                                            >
                                              Transmit
                                            </button>
                                          </>
                                        )}

                                        {expectedPaper.A1 + expectedPaper.A3 + expectedPaper.A4 > 0 && (
                                          <button
                                            onClick={() => {
                                              setSelectedDocForVerify(doc);
                                              setVerifyA1(receivedPaper.A1);
                                              setVerifyA3(receivedPaper.A3);
                                              setVerifyA4(receivedPaper.A4);
                                              setShowVerifyModal(true);
                                            }}
                                            className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 rounded text-[10px] font-bold transition shadow-sm"
                                          >
                                            Verify Paper
                                          </button>
                                        )}

                                        <button
                                          onClick={() => {
                                            setSelectedDocForShare(doc);
                                            setSelectedVersionForShare(latestVersion);
                                            setSharePasscode('');
                                            setGeneratedShareLink('');
                                            setShowShareModal(true);
                                          }}
                                          className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded text-[10px] font-bold transition flex items-center"
                                        >
                                          <Share2 className="mr-1 h-3 w-3" /> Share
                                        </button>
                                      </>
                                    )}

                                    {currentUser.role === "Employer's Office" && doc.status === 'Transmitted to Employer' && (
                                      <button
                                        onClick={() => {
                                          setSelectedDocForReview(doc);
                                          setReviewStatus('Approved');
                                          setShowReviewModal(true);
                                        }}
                                        className="px-2 py-1 bg-green-600 text-white hover:bg-green-700 rounded text-[10px] font-bold transition"
                                      >
                                        Submit Review
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 bg-slate-950/20 flex-shrink-0">
          <p>© 2026 MMRCL PMIS Registry Portal. Built according to Employer's Requirements.</p>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* MODAL WINDOWS */}
      {/* ========================================================================= */}

      {/* 1. UPLOAD FILE MODAL (Initial creation) */}
      {showUploadModal && selectedMatrixItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Create PMIS Submittal</h3>
                <p className="text-xs text-slate-400">{selectedMatrixItem.code}: {selectedMatrixItem.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="text-slate-500 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDocUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Document / Drawing Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Three Month Rolling Plan Rev 0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Drawing/Submittal Number (Unique ID)</label>
                <input
                  type="text"
                  required
                  value={uploadDocNumber}
                  onChange={(e) => setUploadDocNumber(e.target.value)}
                  placeholder="e.g. MMRCL-CON-3MRP-0001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Revision Label</label>
                <input
                  type="text"
                  required
                  disabled
                  value="0"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-lg p-2 text-slate-500 cursor-not-allowed font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Comments / Submission Message</label>
                <textarea
                  value={uploadComments}
                  onChange={(e) => setUploadComments(e.target.value)}
                  rows="3"
                  placeholder="Provide submittal comments or references..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Select Electronic File (PDF, DWG, ZIP)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer pt-2"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition flex items-center disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Submit Submittal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tender Document Upload Modal */}
      {showTenderUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Upload Document</h3>
                <p className="text-xs text-slate-400">Target Folder: {selectedTenderFolder || 'Root (No Folder)'}</p>
              </div>
              <button
                onClick={() => {
                  setShowTenderUploadModal(false);
                  setTenderUploadFile(null);
                  setTenderUploadName('');
                }}
                className="text-slate-555 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTenderUpload} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Document Name / Title</label>
                <input
                  type="text"
                  required
                  value={tenderUploadName}
                  onChange={(e) => setTenderUploadName(e.target.value)}
                  placeholder="e.g. Addendum 4 or Tender Drawing Section"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Select File (PDF, Word, Excel, ZIP, DWG)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setTenderUploadFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer pt-2"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTenderUploadModal(false);
                    setTenderUploadFile(null);
                    setTenderUploadName('');
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tenderUploading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition flex items-center disabled:opacity-50"
                >
                  {tenderUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tender Folder Create Modal */}
      {showTenderFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Folder</h3>
                <p className="text-xs text-slate-400">Add a new folder to Tender Documents Ledger</p>
              </div>
              <button
                onClick={() => {
                  setShowTenderFolderModal(false);
                  setTenderFolderNameInput('');
                }}
                className="text-slate-555 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenderFolder} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Folder Name</label>
                <input
                  type="text"
                  required
                  value={tenderFolderNameInput}
                  onChange={(e) => setTenderFolderNameInput(e.target.value)}
                  placeholder="e.g. 3. New Corrigenda or Drawings"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTenderFolderModal(false);
                    setTenderFolderNameInput('');
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tenderFolderCreating}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition flex items-center disabled:opacity-50"
                >
                  {tenderFolderCreating ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Doc Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Rename File</h3>
                <p className="text-xs text-slate-400">Update file title in the system</p>
              </div>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameFileNameInput('');
                  setRenameFileId(null);
                }}
                className="text-slate-500 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameDocument} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">New Title</label>
                <input
                  type="text"
                  required
                  value={renameFileNameInput}
                  onChange={(e) => setRenameFileNameInput(e.target.value)}
                  placeholder="e.g. Volume 2 Revised Edition"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameFileNameInput('');
                    setRenameFileId(null);
                  }}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renameFileSaving}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition flex items-center disabled:opacity-50"
                >
                  {renameFileSaving ? 'Saving...' : 'Rename File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RE-SUBMIT / NEW REVISION MODAL (Contractor only, for docs with comments) */}
      {selectedDocForRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Upload New Document Revision</h3>
                <p className="text-xs text-slate-400">{selectedDocForRevision.documentNumber}: {selectedDocForRevision.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDocForRevision(null);
                  setUploadFile(null);
                }}
                className="text-slate-500 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRevisionUpload} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">New Revision Label</label>
                <input
                  type="text"
                  required
                  value={uploadRevision}
                  onChange={(e) => setUploadRevision(e.target.value)}
                  placeholder="e.g. 1, A, Rev 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
                <span className="block text-[10px] text-slate-500 mt-1 italic">
                  Current document version is Rev {selectedDocForRevision.currentRevision}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Revision Release Notes</label>
                <textarea
                  value={uploadComments}
                  onChange={(e) => setUploadComments(e.target.value)}
                  rows="3"
                  placeholder="Detail changes made in this revision..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Select New Revision File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer pt-2"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedDocForRevision(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition flex items-center disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Submit Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. REVIEW DOCUMENT MODAL */}
      {showReviewModal && selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Document Review</h3>
                <p className="text-xs text-slate-400">{selectedDocForReview.documentNumber} (Rev {selectedDocForReview.currentRevision})</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-500 hover:text-white font-semibold text-sm">✕</button>
            </div>

            <form onSubmit={handleDocReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Review Status Decision</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                >
                  <option value="Approved">Approved</option>
                  <option value="Approved with Comments">Approved with Comments</option>
                  <option value="Comments Issued">Comments Issued (Request Revision)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Reviewer Comments</label>
                <textarea
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows="4"
                  placeholder="Detail comments or criteria for approval/revision requirements..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-lg transition"
                >
                  Log Review Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TRANSMIT DOCUMENT MODAL (Engineer to Employer) */}
      {showTransmitModal && selectedDocForTransmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Transmit Document package</h3>
                <p className="text-xs text-slate-400">{selectedDocForTransmit.documentNumber} (Rev {selectedDocForTransmit.currentRevision})</p>
              </div>
              <button onClick={() => setShowTransmitModal(false)} className="text-slate-500 hover:text-white font-semibold text-sm">✕</button>
            </div>

            <form onSubmit={handleDocTransmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Destination Authority</label>
                <select
                  value={transmitToRole}
                  onChange={(e) => setTransmitToRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                >
                  <option value="Employer's Office">Employer's Office</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Transmission Remarks</label>
                <textarea
                  value={transmitComments}
                  onChange={(e) => setTransmitComments(e.target.value)}
                  rows="3"
                  placeholder="Optional transmission remarks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransmitModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-lg transition"
                >
                  Execute Transmission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && selectedDocForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Log Physical Hard Copies Handover</h3>
                <p className="text-xs text-slate-400">{selectedDocForVerify.documentNumber} (Rev {selectedDocForVerify.currentRevision})</p>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-500 hover:text-white font-semibold text-sm">✕</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2 text-[10px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block">Expected Counts (Employer's Matrix)</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="block text-slate-500 font-semibold mb-0.5">A1 Drawings</span>
                  <span className="font-bold text-white">{selectedDocForVerify.submittalMatrixId.paperCopies.A1}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="block text-slate-500 font-semibold mb-0.5">A3 Prints</span>
                  <span className="font-bold text-white">{selectedDocForVerify.submittalMatrixId.paperCopies.A3}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="block text-slate-500">A4 Documents</span>
                  <span className="font-bold text-white">{selectedDocForVerify.submittalMatrixId.paperCopies.A4}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyHardCopies} className="space-y-4 text-xs">
              <p className="text-slate-400 text-[10px]">Enter counts actually handed over at site:</p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">A1 Copies Received</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={verifyA1}
                    onChange={(e) => setVerifyA1(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">A3 Copies Received</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={verifyA3}
                    onChange={(e) => setVerifyA3(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">A4 Copies Received</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={verifyA4}
                    onChange={(e) => setVerifyA4(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition"
                >
                  Verify Handover Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal && selectedDocForShare && selectedVersionForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Generate Secure Sharing Link</h3>
                <p className="text-xs text-slate-400">{selectedDocForShare.documentNumber} (Rev {selectedVersionForShare.revision})</p>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setGeneratedShareLink('');
                }}
                className="text-slate-500 hover:text-white font-semibold text-sm"
              >
                ✕
              </button>
            </div>

            {!generatedShareLink ? (
              <form onSubmit={handleGenerateShareLink} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Link Expiration</label>
                  <select
                    value={shareExpiresHours}
                    onChange={(e) => setShareExpiresHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  >
                    <option value="2">2 Hours (Quick Access)</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="168">168 Hours (7 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Access Passcode (Optional Security)</label>
                  <input
                    type="text"
                    value={sharePasscode}
                    onChange={(e) => setSharePasscode(e.target.value)}
                    placeholder="e.g. PMISSecret123 (leave empty for passwordless)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                  <span className="block text-[10px] text-slate-500 mt-1 italic">
                    If set, the recipient must enter this passcode to access/download files.
                  </span>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 select-all font-mono text-[10px] break-all text-sky-400">
                  {generatedShareLink}
                </div>
                {sharePasscode && (
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-400">Security Passcode:</span> <span className="font-bold text-white font-mono">{sharePasscode}</span>
                  </p>
                )}
                <div className="bg-yellow-950/30 border border-yellow-900/60 p-2.5 rounded text-[10px] text-amber-400 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                  <span>
                    This link allows direct electronic file retrieval matching PMIS Rule 14 without needing main database accounts.
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => {
                      setGuestToken(generatedShareLink.split('shareToken=')[1]);
                      setGuestMode(true);
                      handleVerifyGuestLink(generatedShareLink.split('shareToken=')[1]);
                      setShowShareModal(false);
                    }}
                    className="px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-900/60 hover:bg-indigo-500 hover:text-white rounded-lg text-xs font-semibold transition"
                  >
                    Test Share Link
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedShareLink);
                      alert('Share link copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg transition"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showHistoryModal && historyDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">PMIS Document Version History</h3>
                <p className="text-xs text-slate-400">{historyDoc.documentNumber}: {historyDoc.title}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-white font-semibold text-sm">✕</button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-6 py-2 text-xs">
              {historyDoc.versions.map((ver, idx) => (
                <div key={ver._id} className="relative border-l-2 border-slate-800 pl-4 ml-2 pb-2">
                  <div className="absolute -left-1.5 top-0 bg-sky-400 w-3 h-3 rounded-full border border-slate-950"></div>

                  <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                    <span className="text-sm font-bold text-white">Revision {ver.revision}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewRegisterDoc(historyDoc, ver)}
                        className="px-2 py-0.5 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 rounded border border-sky-500/30 text-[10px] font-semibold flex items-center transition"
                        title="View Revision Inline"
                      >
                        <Eye className="mr-1 h-3 w-3" /> View
                      </button>
                      <button
                        onClick={() => handleDownloadSecureFile(documentsAPI.getDownloadUrl(ver._id), ver.originalName || historyDoc.title)}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 text-[10px] font-semibold flex items-center transition"
                        title="Download Revision File"
                      >
                        <Download className="mr-1 h-3 w-3" /> Download
                      </button>
                      <span className="text-[10px] text-slate-500">{new Date(ver.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-400 mb-3 bg-slate-950/30 p-2.5 rounded-lg border border-slate-850/80">
                    <p><span className="font-semibold text-slate-500">File Name:</span> <span className="text-slate-300">{ver.originalName}</span></p>
                    <p><span className="font-semibold text-slate-500">Uploaded By:</span> {ver.uploadedBy?.name} ({ver.uploadedBy?.role})</p>
                    <p>
                      <span className="font-semibold text-slate-500">Review Status:</span>{' '}
                      <span className={`font-semibold ${ver.reviewStatus === 'Approved' ? 'text-green-400' : ver.reviewStatus === 'Comments Issued' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {ver.reviewStatus}
                      </span>
                    </p>
                    {ver.reviewerComments && (
                      <p><span className="font-semibold text-slate-500">Review Comments:</span> <span className="text-slate-300 italic">"{ver.reviewerComments}"</span></p>
                    )}
                    <p>
                      <span className="font-semibold text-slate-500">Hard Copies Logged:</span>{' '}
                      <span className="text-slate-300">
                        A1={ver.hardCopiesReceived.A1}, A3={ver.hardCopiesReceived.A3}, A4={ver.hardCopiesReceived.A4}
                      </span>
                    </p>
                  </div>

                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Transmission Ledger:</span>
                  <div className="space-y-2 pl-2">
                    {ver.transmissionHistory.map((hist, hIdx) => (
                      <div key={hist._id} className="flex items-start text-[11px] text-slate-400 border-l border-slate-800 pl-2 py-0.5">
                        <ChevronRight className="h-3 w-3 mr-1 text-sky-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-300">{hist.fromRole}</span>
                          <span className="text-slate-500"> ➜ </span>
                          <span className="font-semibold text-slate-300">{hist.toRole}</span>
                          <span className="text-[10px] text-slate-500 ml-2">({new Date(hist.transactedAt).toLocaleString()})</span>
                          <p className="text-slate-300 mt-0.5 font-medium">{hist.comments}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-white rounded-lg transition font-semibold text-xs"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT PREVIEW MODAL */}
      {showPreviewModal && previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate" title={previewDoc.title}>{previewDoc.title}</h3>
                  <p className="text-xs text-slate-400 font-mono truncate">{previewDoc.filename}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {previewDoc.viewUrl && (
                  <a
                    href={previewDoc.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold flex items-center transition border border-slate-700"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> New Tab
                  </a>
                )}
                {previewDoc.downloadUrl && (
                  <button
                    onClick={() => handleDownloadSecureFile(previewDoc.downloadUrl, previewDoc.filename)}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-xs font-bold flex items-center transition"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    if (previewBlobUrl) {
                      URL.revokeObjectURL(previewBlobUrl);
                      setPreviewBlobUrl(null);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 bg-slate-950/40 p-4 overflow-auto flex items-center justify-center relative">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-sky-400 space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="text-sm font-semibold text-slate-300">Loading document preview...</span>
                </div>
              ) : previewBlobUrl ? (
                (() => {
                  const mime = (previewDoc.mimeType || '').toLowerCase();
                  const filename = (previewDoc.filename || '').toLowerCase();

                  const isImage = mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(filename);
                  const isPdf = mime === 'application/pdf' || filename.endsWith('.pdf');
                  const isText = mime.startsWith('text/') || mime.includes('json') || /\.(txt|json|csv|md|log|xml)$/.test(filename);
                  const isVideo = mime.startsWith('video/') || /\.(mp4|webm|ogg)$/.test(filename);
                  const isAudio = mime.startsWith('audio/') || /\.(mp3|wav|ogg)$/.test(filename);

                  if (isPdf) {
                    return (
                      <iframe
                        src={previewBlobUrl}
                        className="w-full h-full rounded-xl border border-slate-800 bg-white"
                        title={previewDoc.title}
                      />
                    );
                  }

                  if (isImage) {
                    return (
                      <div className="max-w-full max-h-full flex items-center justify-center p-2">
                        <img
                          src={previewBlobUrl}
                          alt={previewDoc.title}
                          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                        />
                      </div>
                    );
                  }

                  if (isText && previewTextContent) {
                    return (
                      <div className="w-full h-full p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {previewTextContent}
                      </div>
                    );
                  }

                  if (isVideo) {
                    return (
                      <video src={previewBlobUrl} controls className="max-h-[78vh] max-w-full rounded-xl shadow-xl" />
                    );
                  }

                  if (isAudio) {
                    return (
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                        <p className="text-sm font-semibold text-slate-200">{previewDoc.filename}</p>
                        <audio src={previewBlobUrl} controls className="mx-auto" />
                      </div>
                    );
                  }

                  return (
                    <div className="text-center p-8 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md space-y-4 shadow-xl">
                      <div className="p-4 bg-sky-500/10 text-sky-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">Inline Preview Not Supported</h4>
                        <p className="text-xs text-slate-400">
                          Direct browser preview is not available for <span className="font-semibold text-slate-200">{filename}</span>. You can open or download the file.
                        </p>
                      </div>
                      <div className="flex justify-center space-x-3 pt-2">
                        {previewDoc.viewUrl && (
                          <a
                            href={previewDoc.viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition border border-slate-700 flex items-center"
                          >
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Open in New Tab
                          </a>
                        )}
                        <button
                          onClick={() => handleDownloadSecureFile(previewDoc.downloadUrl, previewDoc.filename)}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center text-rose-400 text-xs font-semibold">
                  Failed to load document content for preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp-style Remark Chat Modal */}
      {showRemarkModal && selectedDocForRemark && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-base">File Remarks & Discussion</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {(selectedDocForRemark.remarks?.length) || (selectedDocForRemark.remark ? 1 : 0)} messages
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{selectedDocForRemark.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRemarkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Chat Thread Messages Area */}
            <div className="flex-1 py-4 px-3 space-y-3 overflow-y-auto min-h-[220px] max-h-[360px] bg-slate-50/50 rounded-xl my-3 border border-slate-100">
              {(() => {
                const remarksList = selectedDocForRemark.remarks && selectedDocForRemark.remarks.length > 0
                  ? selectedDocForRemark.remarks
                  : (selectedDocForRemark.remark ? [{
                    text: selectedDocForRemark.remark,
                    userName: selectedDocForRemark.uploadedBy?.name || 'System User',
                    userRole: selectedDocForRemark.uploadedBy?.role || 'Portal',
                    createdAt: selectedDocForRemark.uploadedAt
                  }] : []);

                if (remarksList.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                      <MessageCircle className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-500">No remarks added yet</p>
                    </div>
                  );
                }

                return remarksList.map((msg, idx) => {
                  const authorName = msg.userName || 'User';
                  const isMe = currentUser && (
                    (authorName.toLowerCase() === (currentUser.name || '').toLowerCase()) ||
                    (authorName.toLowerCase() === (currentUser.userId || '').toLowerCase()) ||
                    (msg.user && msg.user === currentUser._id)
                  );

                  const roleText = msg.userRole || '';
                  const isMMRCL = roleText.includes('Employer') || authorName.toUpperCase().includes('MMRCL');
                  const isNECPL = authorName.toUpperCase().includes('NECPL') || roleText.includes('Site Engineer');

                  const badgeColor = isMMRCL
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : isNECPL
                      ? 'bg-sky-100 text-sky-800 border-sky-200'
                      : 'bg-purple-100 text-purple-800 border-purple-200';

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">{isMe ? 'You' : authorName}</span>
                        {roleText && roleText !== 'Portal' && roleText !== 'Member' && roleText !== authorName && (
                          <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${badgeColor}`}>
                            {roleText}
                          </span>
                        )}
                        <span>• {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${isMe
                          ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* WhatsApp-style Input Send Bar */}
            <form onSubmit={handleSaveRemark} className="flex items-center space-x-2 pt-2 border-t border-slate-100 flex-shrink-0">
              <input
                type="text"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Type your remark here..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={remarkSaving || !remarkText.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition shadow-sm disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer"
              >
                {remarkSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
