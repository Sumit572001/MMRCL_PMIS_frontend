import axios from 'axios';

// Dynamic Base URL handling for local (http) vs production server (https)
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:5005`;
  }
  return 'http://localhost:5005';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

// Inject authorization token automatically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pmis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: async (loginId, password) => {
    const response = await api.post('/api/auth/login', { email: loginId, userId: loginId, password });
    if (response.data.success) {
      localStorage.setItem('pmis_token', response.data.token);
      localStorage.setItem('pmis_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (name, email, password, role, organization) => {
    const response = await api.post('/api/auth/register', { name, email, password, role, organization });
    if (response.data.success) {
      localStorage.setItem('pmis_token', response.data.token);
      localStorage.setItem('pmis_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  resetPassword: async (userId, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { userId, newPassword });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('pmis_token');
    localStorage.removeItem('pmis_user');
  }
};

// Submittals Matrix Endpoints
export const submittalsAPI = {
  getMatrix: async () => {
    const response = await api.get('/api/submittals');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/submittals/stats');
    return response.data;
  },
  createMatrixItem: async (data) => {
    const response = await api.post('/api/submittals', data);
    return response.data;
  }
};

// Document Transmission & Control Endpoints
export const documentsAPI = {
  list: async () => {
    const response = await api.get('/api/documents');
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/api/documents/${id}`);
    return response.data;
  },
  upload: async (formData) => {
    const response = await api.post('/api/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  uploadRevision: async (id, formData) => {
    const response = await api.post(`/api/documents/${id}/version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  transmit: async (id, toRole, comments) => {
    const response = await api.post(`/api/documents/${id}/transmit`, { toRole, comments });
    return response.data;
  },
  review: async (id, reviewStatus, comments) => {
    const response = await api.post(`/api/documents/${id}/review`, { reviewStatus, comments });
    return response.data;
  },
  verifyHardCopies: async (id, counts) => {
    const response = await api.post(`/api/documents/${id}/verify-paper`, counts);
    return response.data;
  },
  getDownloadUrl: (versionId) => {
    return `/api/documents/download/${versionId}`;
  },
  getViewUrl: (versionId) => {
    const token = localStorage.getItem('pmis_token');
    return `/api/documents/view/${versionId}?token=${token || ''}`;
  }
};

// Secure Link Sharing Endpoints
export const shareAPI = {
  generateLink: async (documentId, versionId, expiresInHours, passcode) => {
    const response = await api.post('/api/share', { documentId, versionId, expiresInHours, passcode });
    return response.data;
  },
  verifyToken: async (token) => {
    const response = await api.get(`/api/share/verify/${token}`);
    return response.data;
  },
  accessLink: async (token, passcode) => {
    const response = await api.post(`/api/share/access/${token}`, { passcode });
    return response.data;
  },
  getSharedDownloadUrl: (token, passcode) => {
    return `/api/share/download/${token}?passcode=${encodeURIComponent(passcode || '')}`;
  }
};

// Generic Documents & Folders Endpoints for sections
export const generalDocsAPI = {
  list: async (section) => {
    const response = await api.get(`/api/${section}`);
    return response.data;
  },
  getFolders: async (section) => {
    const response = await api.get(`/api/${section}/folders`);
    return response.data;
  },
  createFolder: async (section, name, parentFolder = null) => {
    const response = await api.post(`/api/${section}/folders`, { name, parentFolder });
    return response.data;
  },
  deleteFolder: async (section, id) => {
    const response = await api.delete(`/api/${section}/folders/${id}`);
    return response.data;
  },
  upload: async (section, formData) => {
    const response = await api.post(`/api/${section}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getDownloadUrl: (section, id) => {
    return `/api/${section}/download/${id}`;
  },
  getViewUrl: (section, id) => {
    const token = localStorage.getItem('pmis_token');
    return `/api/${section}/view/${id}?token=${token || ''}`;
  },
  deleteDocument: async (section, id) => {
    const response = await api.delete(`/api/${section}/${id}`);
    return response.data;
  },
  renameDocument: async (section, id, name) => {
    const response = await api.put(`/api/${section}/${id}`, { name });
    return response.data;
  },
  updateRemark: async (section, id, data) => {
    if (data instanceof FormData) {
      const response = await api.put(`/api/${section}/${id}/remark`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
    const payload = typeof data === 'string' ? { text: data } : data;
    const response = await api.put(`/api/${section}/${id}/remark`, payload);
    return response.data;
  },
  getRemarkAttachmentUrl: (section, filePathOrName) => {
    const filename = (filePathOrName || '').replace(/^.*[\\\/]/, '');
    const token = localStorage.getItem('pmis_token');
    return `/api/${section}/remark-attachment/${filename}?token=${token || ''}`;
  },
  markRemarkRead: async (section, id) => {
    const response = await api.put(`/api/${section}/${id}/remark/read`);
    return response.data;
  },
  deleteRemark: async (section, id, remarkId) => {
    const response = await api.delete(`/api/${section}/${id}/remark/${remarkId}`);
    return response.data;
  },
  clearDocumentRemarks: async (section, id) => {
    const response = await api.delete(`/api/${section}/${id}/remarks/clear-all`);
    return response.data;
  },
  getAllUploads: async () => {
    const response = await api.get('/api/tender/all-uploads');
    return response.data;
  },
  markDocumentViewed: async (section, id) => {
    const response = await api.put(`/api/${section}/${id}/viewed`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await api.put('/api/tender/mark-all-read');
    return response.data;
  },
  resetAllRemarks: async () => {
    const response = await api.put('/api/tender/reset-all-remarks');
    return response.data;
  },
  uploadSubDocument: async (section, id, formData) => {
    const response = await api.post(`/api/${section}/${id}/sub-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  renameSubDocument: async (section, id, subId, name) => {
    const response = await api.put(`/api/${section}/${id}/sub-document/${subId}/rename`, { name });
    return response.data;
  },
  deleteSubDocument: async (section, id, subId) => {
    const response = await api.delete(`/api/${section}/${id}/sub-document/${subId}`);
    return response.data;
  },
  addSubDocRemark: async (section, id, subId, payload) => {
    const isFormData = payload instanceof FormData;
    const response = await api.post(
      `/api/${section}/${id}/sub-document/${subId}/remark`,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return response.data;
  },
  markSubDocRemarksRead: async (section, id, subId) => {
    const response = await api.put(`/api/${section}/${id}/sub-document/${subId}/remark/read`);
    return response.data;
  },
  clearSubDocRemarks: async (section, id, subId) => {
    const response = await api.delete(`/api/${section}/${id}/sub-document/${subId}/remarks/clear-all`);
    return response.data;
  }
};

// Aliases for backward compatibility
export const tenderAPI = {
  list: () => generalDocsAPI.list('tender'),
  getFolders: () => generalDocsAPI.getFolders('tender'),
  createFolder: (name) => generalDocsAPI.createFolder('tender', name),
  deleteFolder: (id) => generalDocsAPI.deleteFolder('tender', id),
  upload: (formData) => generalDocsAPI.upload('tender', formData),
  getDownloadUrl: (id) => generalDocsAPI.getDownloadUrl('tender', id)
};

export const contractualAPI = {
  list: () => generalDocsAPI.list('contractual'),
  getFolders: () => generalDocsAPI.getFolders('contractual'),
  createFolder: (name) => generalDocsAPI.createFolder('contractual', name),
  deleteFolder: (id) => generalDocsAPI.deleteFolder('contractual', id),
  upload: (formData) => generalDocsAPI.upload('contractual', formData),
  getDownloadUrl: (id) => generalDocsAPI.getDownloadUrl('contractual', id)
};

export default api;
