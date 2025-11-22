export const nfEUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
export const euro = (n: number) => nfEUR.format(n);
