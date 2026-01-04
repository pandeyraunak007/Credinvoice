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
      // Include validation errors in the error message if available
      let errorMessage = data.message || 'API request failed';
      if (data.errors && Array.isArray(data.errors)) {
        const errorDetails = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `${errorMessage} - ${errorDetails}`;
      }
      throw new Error(errorMessage);
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

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  verifyResetToken: (token) =>
    apiRequest(`/auth/verify-reset-token/${token}`),
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

  // Get verified sellers for invoice creation
  getVerifiedSellers: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/profile/sellers${params}`);
  },

  // Get verified buyers for GST-backed financing (seller creates invoice)
  getVerifiedBuyers: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/profile/buyers${params}`);
  },

  // Create seller referral
  createSellerReferral: (data) =>
    apiRequest('/profile/referrals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get my referrals
  getMyReferrals: () => apiRequest('/profile/referrals'),
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

  getMyOffers: () => apiRequest('/discounts/my-offers'),

  getPending: () => apiRequest('/discounts/pending'),

  respond: (id, data) =>
    apiRequest(`/discounts/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  accept: (id) =>
    apiRequest(`/discounts/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'ACCEPT' }),
    }),

  reject: (id, reason) =>
    apiRequest(`/discounts/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'REJECT', rejectionReason: reason }),
    }),

  // Buyer selects funding type after seller accepts
  selectFundingType: (id, fundingType) =>
    apiRequest(`/discounts/${id}/select-funding-type`, {
      method: 'POST',
      body: JSON.stringify({ fundingType }),
    }),

  // Buyer authorizes self-funded payment
  authorizePayment: (id, bankAccountId) =>
    apiRequest(`/discounts/${id}/authorize-payment`, {
      method: 'POST',
      body: JSON.stringify({ bankAccountId }),
    }),

  // Buyer revises a rejected offer (max 2 revisions)
  reviseOffer: (id, data) =>
    apiRequest(`/discounts/${id}/revise`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cancel a discount offer
  cancel: (id) =>
    apiRequest(`/discounts/${id}/cancel`, {
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
  // KYC Applications
  getKycApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/kyc-applications${query ? `?${query}` : ''}`);
  },

  getKycApplicationDetails: (userId) => apiRequest(`/admin/kyc-applications/${userId}`),

  approveKyc: (userId, data = {}) =>
    apiRequest(`/admin/kyc-applications/${userId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rejectKyc: (userId, data) =>
    apiRequest(`/admin/kyc-applications/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => apiRequest('/admin/dashboard'),

  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUserDetails: (userId) => apiRequest(`/admin/users/${userId}`),

  updateUserStatus: (userId, data) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Invoices
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/invoices${query ? `?${query}` : ''}`);
  },

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/transactions${query ? `?${query}` : ''}`);
  },

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

// Analytics Service
export const analyticsService = {
  // Buyer Analytics
  getBuyerSummary: (period = 'month') =>
    apiRequest(`/analytics/buyer/summary?period=${period}`),

  getBuyerInvoiceTrends: (period = 'month', groupBy = 'week') =>
    apiRequest(`/analytics/buyer/invoice-trends?period=${period}&groupBy=${groupBy}`),

  getBuyerDiscountSavings: (period = 'month') =>
    apiRequest(`/analytics/buyer/discount-savings?period=${period}`),

  getBuyerSellerPerformance: (period = 'month', limit = 10) =>
    apiRequest(`/analytics/buyer/seller-performance?period=${period}&limit=${limit}`),

  getBuyerFundingBreakdown: (period = 'month') =>
    apiRequest(`/analytics/buyer/funding-breakdown?period=${period}`),

  // Seller Analytics
  getSellerSummary: (period = 'month') =>
    apiRequest(`/analytics/seller/summary?period=${period}`),

  getSellerRevenueTrends: (period = 'month', groupBy = 'week') =>
    apiRequest(`/analytics/seller/revenue-trends?period=${period}&groupBy=${groupBy}`),

  getSellerDiscountAnalysis: (period = 'month') =>
    apiRequest(`/analytics/seller/discount-analysis?period=${period}`),

  getSellerBuyerMetrics: (period = 'month', limit = 10) =>
    apiRequest(`/analytics/seller/buyer-metrics?period=${period}&limit=${limit}`),

  // Financier Analytics
  getFinancierSummary: (period = 'month') =>
    apiRequest(`/analytics/financier/summary?period=${period}`),

  getFinancierPortfolioTrends: (period = 'month', groupBy = 'week') =>
    apiRequest(`/analytics/financier/portfolio-trends?period=${period}&groupBy=${groupBy}`),

  getFinancierYieldAnalysis: (period = 'month') =>
    apiRequest(`/analytics/financier/yield-analysis?period=${period}`),

  getFinancierSectorBreakdown: () =>
    apiRequest('/analytics/financier/sector-breakdown'),

  // Admin Analytics
  getAdminPlatformSummary: (period = 'month') =>
    apiRequest(`/analytics/admin/platform-summary?period=${period}`),

  getAdminUserGrowth: (period = 'month', groupBy = 'week') =>
    apiRequest(`/analytics/admin/user-growth?period=${period}&groupBy=${groupBy}`),

  getAdminKycFunnel: (period = 'month') =>
    apiRequest(`/analytics/admin/kyc-funnel?period=${period}`),

  getAdminInvoiceDistribution: (period = 'month') =>
    apiRequest(`/analytics/admin/invoice-distribution?period=${period}`),
};

// Notification Service
export const notificationService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${query ? `?${query}` : ''}`);
  },

  getUnreadCount: () => apiRequest('/notifications?unreadOnly=true&limit=1'),

  markAsRead: (notificationId) =>
    apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    }),

  markAllAsRead: () =>
    apiRequest('/notifications/mark-all-read', {
      method: 'POST',
    }),

  delete: (notificationId) =>
    apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    }),
};

// Contract Service
export const contractService = {
  // Get all contracts for the current user
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/contracts${query ? `?${query}` : ''}`);
  },

  // Get contract by ID
  getById: (id) => apiRequest(`/contracts/${id}`),

  // Get contract by invoice ID
  getByInvoiceId: (invoiceId) => apiRequest(`/contracts/invoice/${invoiceId}`),

  // Get contract text (for display)
  getText: (id) => apiRequest(`/contracts/${id}/text`),

  // Download contract as text file
  download: async (id) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download contract');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `contract-${id}.txt`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Download contract as PDF
  downloadPDF: async (id) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download contract PDF');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `contract-${id}.pdf`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
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
  analytics: analyticsService,
  notification: notificationService,
  contract: contractService,
};
