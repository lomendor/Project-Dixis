export function adminEnabled(): boolean {
  return process.env.BASIC_AUTH === '1';
}
