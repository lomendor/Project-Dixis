export type PaymentInit = { 
  amount: number; 
  currency?: 'EUR'; 
  method?: 'cod' | 'stripe'; 
  meta?: any 
};

export type PaymentResult = { 
  ok: boolean; 
  provider: 'cod' | 'stripe'; 
  id: string; 
  clientSecret?: string; 
  message?: string 
};

export async function createPaymentIntent({ 
  amount, 
  currency = 'EUR', 
  method = 'cod' 
}: PaymentInit): Promise<PaymentResult> {
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;
  
  if (method === 'stripe' && hasStripe) {
    console.log('[pay] stripe requested but not implemented in this pass — fallback to COD');
  }
  
  const timestamp = new Date().getTime();
  return { 
    ok: true, 
    provider: 'cod', 
    id: `cod_${timestamp}`, 
    message: 'Cash on Delivery' 
  };
}
