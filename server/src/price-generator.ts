// 接收前一價格，回傳模擬後新價格
export function generatePrice(prev: number, volatility = 1): number {
  const delta = (Math.random() - 0.5) * 2 * volatility;
  return prev + delta;
}
