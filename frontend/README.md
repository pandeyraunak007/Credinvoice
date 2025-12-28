# CredInvoice UI Prototype

A fully functional UI prototype for the CredInvoice Supply Chain Finance Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Navigate to project folder
cd credinvoice-prototype

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## 📱 Available Pages

### Buyer Portal (Blue Theme)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPIs, pending actions, quick stats |
| `/invoices` | Invoice List | Search, filter, manage all invoices |
| `/invoices/create` | Create Invoice | 4-step wizard with AI extraction |
| `/invoices/:id` | Invoice Detail | Full invoice view with timeline |
| `/invoices/:id/bids` | Bid Review | Compare and select financier bids |

### Seller Portal (Green Theme)
| Route | Page | Description |
|-------|------|-------------|
| `/seller` | Dashboard | Pending offers, payments, financing |
| `/seller/offers/:id` | Offer Detail | Review and accept/reject discount offers |

## 🎨 Features Demonstrated

### AI Invoice Extraction
- Drag & drop file upload
- Animated extraction progress
- Confidence scores per field
- Inline editing for corrections
- Validation results display

### Dynamic Discounting Flow
1. Buyer uploads invoice
2. AI extracts data
3. Buyer sets discount %
4. Seller receives notification
5. Seller accepts/rejects
6. Funding selection (Self/Financier)
7. Bid comparison (if financier)
8. Disbursement

### Bid Review
- Expandable bid cards
- Side-by-side comparison table
- Net amount calculations
- Confirmation modals

## 🔄 Portal Switcher

Use the floating button in the bottom-right corner to switch between Buyer and Seller portals.

## 📁 Project Structure

```
credinvoice-prototype/
├── src/
│   ├── pages/
│   │   ├── buyer/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── CreateInvoice.jsx
│   │   │   ├── InvoiceDetail.jsx
│   │   │   └── BidReview.jsx
│   │   └── seller/
│   │       └── SellerPortal.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠 Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## 📝 Notes

- This is a UI prototype with mock data
- No backend integration - all data is static
- Navigation between pages is functional
- Modals and forms are interactive

## 🎯 Next Steps for Development

1. Connect to real API endpoints
2. Add authentication flow
3. Implement state management (Redux/Zustand)
4. Add form validation (React Hook Form + Zod)
5. Integrate real AI extraction service
6. Add WebSocket for real-time notifications

---

Built with ❤️ for CredInvoice
