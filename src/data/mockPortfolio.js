
/**
 * AtoZ Broking - Portfolio Data
 *
 * IMPORTANT:
 * No hardcoded demo investments, transactions,
 * or fake market performance.
 *
 * Actual portfolio and transaction data must come
 * from the authenticated backend API.
 *
 * Empty arrays mean no data has been loaded here.
 * They do NOT confirm that the backend returned zero.
 */

// Portfolio holdings
export const mockHoldings = [];

// Portfolio performance
export const mockPerformance = {
  "1D": [],
  "1W": [],
  "1M": [],
  "6M": [],
  "1Y": [],
};

// Transactions: actual data must come from the backend API
export const mockTransactions = [];

// Report definitions only (these are report types, not fake financial data)
export const mockReports = [
  {
    id: "portfolio",
    icon: "PieChart",
    title: "Portfolio Statement",
    description: "Complete snapshot of your holdings with current valuation.",
  },
  {
    id: "transaction",
    icon: "ArrowLeftRight",
    title: "Transaction Statement",
    description:
      "Detailed list of all buy, sell, deposit and withdrawal entries.",
  },
  {
    id: "capital-gain",
    icon: "TrendingUp",
    title: "Capital Gain Report",
    description: "Short-term and long-term gains for tax filing.",
  },
  {
    id: "account",
    icon: "FileText",
    title: "Account Statement",
    description:
      "Ledger of funds, charges and account balance movements.",
  },
];
