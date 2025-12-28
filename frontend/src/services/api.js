const API_BASE_URL = '/api/v1';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Auth Service
export const authService = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: (refreshToken) =>
    apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// Profile Service
export const profileService = {
  getProfile: () => apiRequest('/profile'),

  updateProfile: (data) =>
    apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getBankAccounts: () => apiRequest('/profile/bank-accounts'),

  addBankAccount: (data) =>
    apiRequest('/profile/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// KYC Service
export const kycService = {
  getStatus: () => apiRequest('/kyc/status'),

  getDocuments: () => apiRequest('/kyc/documents'),

  uploadDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/kyc/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  deleteDocument: (documentId) =>
    apiRequest(`/kyc/documents/${documentId}`, {
      method: 'DELETE',
    }),

  // Submit complete KYC - updates profile and uploads documents
  submitCompleteKYC: async (profileData, bankData, documents) => {
    const results = { profile: null, bank: null, documents: [] };

    // 1. Update profile with business details
    try {
      const profileResponse = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      results.profile = profileResponse;
    } catch (err) {
      console.error('Profile update failed:', err);
      throw new Error(`Profile update failed: ${err.message}`);
    }

    // 2. Add bank account
    if (bankData && bankData.accountNo) {
      try {
        const bankResponse = await apiRequest('/profile/bank-accounts', {
          method: 'POST',
          body: JSON.stringify(bankData),
        });
        results.bank = bankResponse;
      } catch (err) {
        console.error('Bank account add failed:', err);
        // Continue even if bank fails
      }
    }

    // 3. Upload documents
    const docTypeMap = {
      panCard: 'PAN_CARD',
      gstCertificate: 'GST_CERTIFICATE',
      incorporationCert: 'INCORPORATION_CERTIFICATE',
      cancelledCheque: 'CANCELLED_CHEQUE',
      bankStatement: 'BANK_STATEMENT',
      addressProof: 'ADDRESS_PROOF',
      signatoryPan: 'DIRECTOR_ID',
      signatoryAadhaar: 'OTHER',
    };

    for (const [key, file] of Object.entries(documents)) {
      if (file && docTypeMap[key]) {
        try {
          const docResult = await kycService.uploadDocument(file, docTypeMap[key]);
          results.documents.push({ type: key, result: docResult });
        } catch (err) {
          console.error(`Document upload failed for ${key}:`, err);
          // Continue with other documents
        }
      }
    }

    return results;
  },
};

// Invoice Service
export const invoiceService = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/invoices${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/invoices/${id}`),

  create: (data) =>
    apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    }),

  submit: (id) =>
    apiRequest(`/invoices/${id}/submit`, {
      method: 'POST',
    }),

  accept: (id) =>
    apiRequest(`/invoices/${id}/accept`, {
      method: 'POST',
    }),

  openForBidding: (id) =>
    apiRequest(`/invoices/${id}/open-for-bidding`, {
      method: 'POST',
    }),

  getAvailable: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/invoices/available${query ? `?${query}` : ''}`);
  },

  extractFromFile: async (file) => {
    const formData = new FormData();
    formData.append('invoice', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/invoices/extract`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

// Bid Service
export const bidService = {
  create: (data) =>
    apiRequest('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id) => apiRequest(`/bids/${id}`),

  getForInvoice: (invoiceId) => apiRequest(`/bids/invoice/${invoiceId}`),

  getMyBids: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/bids/my-bids${query ? `?${query}` : ''}`);
  },

  update: (id, data) =>
    apiRequest(`/bids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  withdraw: (id) =>
    apiRequest(`/bids/${id}/withdraw`, {
      method: 'POST',
    }),

  accept: (id) =>
    apiRequest(`/bids/${id}/accept`, {
      method: 'POST',
    }),
};

// Discount Service (for Dynamic Discounting)
export const discountService = {
  createOffer: (data) =>
    apiRequest('/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id) => apiRequest(`/discounts/${id}`),

  getPending: () => apiRequest('/discounts/pending'),

  accept: (id) =>
    apiRequest(`/discounts/${id}/accept`, {
      method: 'POST',
    }),

  reject: (id) =>
    apiRequest(`/discounts/${id}/reject`, {
      method: 'POST',
    }),
};

// Disbursement Service
export const disbursementService = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/disbursements${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/disbursements/${id}`),

  initiateSelfFunded: (data) =>
    apiRequest('/disbursements/self-funded', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  initiateFinancier: (data) =>
    apiRequest('/disbursements/financier', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id, data) =>
    apiRequest(`/disbursements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getUpcomingRepayments: () => apiRequest('/disbursements/repayments/upcoming'),

  markRepaymentPaid: (repaymentId) =>
    apiRequest(`/disbursements/repayments/${repaymentId}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

// Admin Service
export const adminService = {
  getKYCQueue: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/kyc${query ? `?${query}` : ''}`);
  },

  getKYCApplication: (id) => apiRequest(`/admin/kyc/${id}`),

  approveKYC: (id, data) =>
    apiRequest(`/admin/kyc/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rejectKYC: (id, data) =>
    apiRequest(`/admin/kyc/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  requestResubmission: (id, data) =>
    apiRequest(`/admin/kyc/${id}/resubmit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default {
  auth: authService,
  profile: profileService,
  kyc: kycService,
  invoice: invoiceService,
  bid: bidService,
  discount: discountService,
  disbursement: disbursementService,
  admin: adminService,
};
