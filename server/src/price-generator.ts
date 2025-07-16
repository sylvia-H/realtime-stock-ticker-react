export function generatePrice(prev: number): number {
  const delta = (Math.random() - 0.5) * 2;
  return prev + delta;
}
