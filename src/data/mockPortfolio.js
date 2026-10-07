export const mockHoldings = [
  { id: 1, name: 'Reliance Industries', symbol: 'RELIANCE', type: 'Equity', qty: 50, avg: 2400, price: 2680 },
  { id: 2, name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'Equity', qty: 100, avg: 1500, price: 1620 },
  { id: 3, name: 'Infosys', symbol: 'INFY', type: 'Equity', qty: 80, avg: 1450, price: 1530 },
  { id: 4, name: 'Tata Consultancy Services', symbol: 'TCS', type: 'Equity', qty: 20, avg: 3300, price: 3180 },
  { id: 5, name: 'Parag Parikh Flexi Cap Fund', symbol: 'PPFCF', type: 'Mutual Fund', qty: 2000, avg: 60, price: 68.4 },
  { id: 6, name: 'Axis Bluechip Fund', symbol: 'AXISBC', type: 'Mutual Fund', qty: 1500, avg: 52, price: 55.2 },
  { id: 7, name: 'HDFC Corporate Bond Fund', symbol: 'HDFCCB', type: 'Debt', qty: 3000, avg: 30, price: 32.5 },
  { id: 8, name: 'ICICI Gilt Fund', symbol: 'ICICIGILT', type: 'Debt', qty: 2000, avg: 27.5, price: 29.2 },
  { id: 9, name: 'Sovereign Gold Bond 2031', symbol: 'SGB31', type: 'Others', qty: 10, avg: 5500, price: 6400 },
]
const series = (labels, start, end, wiggle) =>
  labels.map((label, i) => ({ label, value: Math.round(start + ((end - start) * i) / (labels.length - 1) + Math.sin(i * 1.7) * wiggle) }))
const seq = (n, prefix) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`)
export const mockPerformance = {
  '1D': series(['9:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:30'], 917000, 921500, 1200),
  '1W': series(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 905000, 921500, 2500),
  '1M': series(seq(8, 'D'), 880000, 921500, 5000),
  '6M': series(['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], 835000, 921500, 9000),
  '1Y': series(['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Sep', 'Oct'], 780000, 921500, 12000),
}
