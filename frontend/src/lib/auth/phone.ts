export function normalizePhone(p: string): string {
  const s = p.replace(/\s+/g,'');
  if (s.startsWith('+')) return s;
  if (s.startsWith('00')) return '+' + s.slice(2);
  // Αν ξεκινά με 0 και μοιάζει με ελληνικό κινητό, πρόσθεσε +30
  if (s.startsWith('0')) return '+30' + s.slice(1);
  // Αλλιώς όπως είναι, αν ήδη έχει country code χωρίς +
  if (/^\d{10,15}$/.test(s)) return '+' + s;
  return s;
}
