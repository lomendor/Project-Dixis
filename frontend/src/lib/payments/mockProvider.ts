export type PaymentSession = { id: string; amount: number; currency: 'EUR' };

export async function createSession(amount: number): Promise<PaymentSession> {
  // Simulate API call delay
  await new Promise((r) => setTimeout(r, 150));
  return {
    id: 'sess_' + Math.random().toString(36).slice(2),
    amount,
    currency: 'EUR',
  };
}

export async function confirmPayment(
  _sessionId: string
): Promise<{ ok: boolean }> {
  // Simulate payment processing delay
  await new Promise((r) => setTimeout(r, 250));
  // 95% success rate for realism
  const ok = Math.random() < 0.95;
  return { ok };
}
