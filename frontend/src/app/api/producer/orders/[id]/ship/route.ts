import { NextRequest, NextResponse } from 'next/server';
import { validateOrderStatusUpdate } from '@/lib/order-status-validator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID παραγγελίας απαιτείται' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Απαιτείται πιστοποίηση' },
        { status: 401 }
      );
    }

    const mockCurrentOrder = {
      id: parseInt(orderId),
      status: 'paid' as const,
      shipment: {
        id: `ship_${orderId}`,
        status: 'pending' as const
      }
    };

    const validation = validateOrderStatusUpdate(mockCurrentOrder.status, 'shipped');
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedOrder = {
      ...mockCurrentOrder,
      status: 'shipped' as const,
      shipment: {
        ...mockCurrentOrder.shipment,
        status: 'shipped' as const,
        shipped_at: new Date().toISOString(),
        tracking_number: `TRK${Date.now()}${orderId}`
      }
    };

    return NextResponse.json({
      message: 'Η παραγγελία σημειώθηκε ως απεσταλμένη επιτυχώς',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Σφάλμα στη σήμανση παραγγελίας ως απεσταλμένη:', error);
    return NextResponse.json(
      { error: 'Εσωτερικό σφάλμα διακομιστή' },
      { status: 500 }
    );
  }
}