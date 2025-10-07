export function getShippingConfig(){
  const flat = Number(process.env.SHIPPING_FLAT_EUR ?? 3.5);
  const freeOver = Number(process.env.SHIPPING_FREE_OVER_EUR ?? 35);
  return { flat, freeOver };
}

export function computeShipping(subtotal: number): number {
  const { flat, freeOver } = getShippingConfig();
  if (subtotal >= freeOver) return 0;
  return flat;
}
