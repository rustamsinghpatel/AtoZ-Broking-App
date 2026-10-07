export const mockTransactions = [
  { id: 'TXN100245', date: '2026-10-05', type: 'Buy', asset: 'Infosys', qty: 10, amount: 15300, status: 'Completed' },
  { id: 'TXN100238', date: '2026-10-03', type: 'Deposit', asset: 'Funds Added (UPI)', qty: null, amount: 50000, status: 'Completed' },
  { id: 'TXN100231', date: '2026-10-01', type: 'Sell', asset: 'Tata Consultancy Services', qty: 5, amount: 15900, status: 'Pending' },
  { id: 'TXN100219', date: '2026-09-28', type: 'Buy', asset: 'Axis Bluechip Fund', qty: 500, amount: 27600, status: 'Completed' },
  { id: 'TXN100207', date: '2026-09-25', type: 'Withdrawal', asset: 'Bank Transfer', qty: null, amount: 25000, status: 'Failed' },
  { id: 'TXN100196', date: '2026-09-20', type: 'Buy', asset: 'Reliance Industries', qty: 10, amount: 26800, status: 'Completed' },
  { id: 'TXN100184', date: '2026-09-15', type: 'Sell', asset: 'HDFC Bank', qty: 20, amount: 32400, status: 'Completed' },
  { id: 'TXN100172', date: '2026-09-10', type: 'Deposit', asset: 'Funds Added (NEFT)', qty: null, amount: 100000, status: 'Completed' },
  { id: 'TXN100163', date: '2026-09-04', type: 'Buy', asset: 'ICICI Gilt Fund', qty: 1000, amount: 29200, status: 'Completed' },
  { id: 'TXN100150', date: '2026-08-29', type: 'Buy', asset: 'Sovereign Gold Bond 2031', qty: 5, amount: 32000, status: 'Completed' },
  { id: 'TXN100141', date: '2026-08-22', type: 'Withdrawal', asset: 'Bank Transfer', qty: null, amount: 40000, status: 'Completed' },
  { id: 'TXN100133', date: '2026-08-14', type: 'Buy', asset: 'Parag Parikh Flexi Cap Fund', qty: 300, amount: 20520, status: 'Completed' },
]
export const mockReports = [
  { id: 'portfolio', icon: 'PieChart', title: 'Portfolio Statement', description: 'Complete snapshot of your holdings with current valuation.' },
  { id: 'transaction', icon: 'ArrowLeftRight', title: 'Transaction Statement', description: 'Detailed list of all buy, sell, deposit and withdrawal entries.' },
  { id: 'capital-gain', icon: 'TrendingUp', title: 'Capital Gain Report', description: 'Short-term and long-term gains for tax filing.' },
  { id: 'account', icon: 'FileText', title: 'Account Statement', description: 'Ledger of funds, charges and account balance movements.' },
]
