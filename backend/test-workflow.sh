#!/bin/bash
# Test Invoice to Bid Workflow
set +H  # Disable history expansion to allow ! in strings

BASE_URL="http://localhost:3000/api/v1"

echo "=== Step 1: Login all users ==="

# Login Buyer
BUYER_RESP=$(curl -s "$BASE_URL/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Password123!"}')
BUYER_TOKEN=$(echo $BUYER_RESP | sed 's/.*"accessToken":"//' | sed 's/".*//')
echo "Buyer Token: ${BUYER_TOKEN:0:50}..."

# Login Seller
SELLER_RESP=$(curl -s "$BASE_URL/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"seller@example.com","password":"Seller123!"}')
SELLER_TOKEN=$(echo $SELLER_RESP | sed 's/.*"accessToken":"//' | sed 's/".*//')
echo "Seller Token: ${SELLER_TOKEN:0:50}..."

# Login Financier
FINANCIER_RESP=$(curl -s "$BASE_URL/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"financier@example.com","password":"Finance123!"}')
FINANCIER_TOKEN=$(echo $FINANCIER_RESP | sed 's/.*"accessToken":"//' | sed 's/".*//')
echo "Financier Token: ${FINANCIER_TOKEN:0:50}..."

echo ""
echo "=== Step 2: Seller creates invoice ==="
# Valid GSTIN format: 2 digit state + 10 char PAN + 1 entity + Z + 1 checksum
INVOICE_RESP=$(curl -s "$BASE_URL/invoices" -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{
    "invoiceNumber": "INV-2025-003",
    "invoiceDate": "2025-12-28",
    "dueDate": "2026-02-28",
    "sellerGstin": "29AABCS1429B1ZB",
    "sellerName": "Seller Corp",
    "buyerGstin": "29AABCT1234E1ZH",
    "buyerName": "Test Enterprises",
    "subtotal": 100000,
    "taxAmount": 18000,
    "totalAmount": 118000,
    "productType": "DD_EARLY_PAYMENT"
  }')
echo "Invoice Response: $INVOICE_RESP"

# Extract invoice ID more reliably
INVOICE_ID=$(echo "$INVOICE_RESP" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
echo "Invoice ID: $INVOICE_ID"

if [ -z "$INVOICE_ID" ] || [ "$INVOICE_ID" = "{" ]; then
  echo "Failed to create invoice. Exiting."
  exit 1
fi

echo ""
echo "=== Step 3: Buyer accepts invoice ==="
ACCEPT_RESP=$(curl -s "$BASE_URL/invoices/$INVOICE_ID/accept" -X POST \
  -H "Authorization: Bearer $BUYER_TOKEN")
echo "Accept Response: $ACCEPT_RESP"

echo ""
echo "=== Step 4: Open invoice for bidding ==="
OPEN_RESP=$(curl -s "$BASE_URL/invoices/$INVOICE_ID/open-for-bidding" -X POST \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "Open for Bidding Response: $OPEN_RESP"

echo ""
echo "=== Step 5: Financier views available invoices ==="
AVAILABLE_RESP=$(curl -s "$BASE_URL/invoices/available" \
  -H "Authorization: Bearer $FINANCIER_TOKEN")
echo "Available Invoices: $AVAILABLE_RESP"

echo ""
echo "=== Step 6: Financier places bid ==="
# Valid until 30 days from now
VALID_UNTIL=$(date -d "+30 days" +%Y-%m-%dT00:00:00Z 2>/dev/null || date -v+30d +%Y-%m-%dT00:00:00Z 2>/dev/null || echo "2026-01-30T00:00:00Z")
BID_RESP=$(curl -s "$BASE_URL/bids" -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FINANCIER_TOKEN" \
  -d "{
    \"invoiceId\": \"$INVOICE_ID\",
    \"discountRate\": 12.5,
    \"haircutPercentage\": 2,
    \"processingFee\": 500,
    \"validUntil\": \"$VALID_UNTIL\"
  }")
echo "Bid Response: $BID_RESP"

BID_ID=$(echo "$BID_RESP" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
echo "Bid ID: $BID_ID"

echo ""
echo "=== Step 7: View bids for invoice ==="
BIDS_RESP=$(curl -s "$BASE_URL/bids/invoice/$INVOICE_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "Invoice Bids: $BIDS_RESP"

echo ""
echo "=== Step 8: Seller accepts bid ==="
ACCEPT_BID_RESP=$(curl -s "$BASE_URL/bids/$BID_ID/accept" -X POST \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "Accept Bid Response: $ACCEPT_BID_RESP"

echo ""
echo "=== Step 9: Check final invoice status ==="
FINAL_INVOICE=$(curl -s "$BASE_URL/invoices/$INVOICE_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN")
echo "Final Invoice: $FINAL_INVOICE"

echo ""
echo "=== Workflow Complete ==="
