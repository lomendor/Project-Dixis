import { NextRequest, NextResponse } from 'next/server';
import { validateOrderStatusUpdate, validateShipmentStatusUpdate, type OrderStatus, type ShipmentStatus } from '@/lib/order-status-validator';

interface StatusUpdateRequest {
  status: OrderStatus;
}

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

    const body: StatusUpdateRequest = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: 'Η νέα κατάσταση είναι απαραίτητη' },
        { status: 400 }
      );
    }

    const mockCurrentOrder = {
      id: parseInt(orderId),
      status: 'paid' as OrderStatus,
      shipment: {
        id: `ship_${orderId}`,
        status: 'pending' as ShipmentStatus
      }
    };

    const orderValidation = validateOrderStatusUpdate(mockCurrentOrder.status, body.status);
    if (!orderValidation.isValid) {
      return NextResponse.json(
        { error: orderValidation.error },
        { status: 400 }
      );
    }

    let updatedShipmentStatus: ShipmentStatus = mockCurrentOrder.shipment.status;

    if (body.status === 'shipped' && mockCurrentOrder.shipment.status === 'pending') {
      const shipmentValidation = validateShipmentStatusUpdate('pending', 'shipped');
      if (shipmentValidation.isValid) {
        updatedShipmentStatus = 'shipped';
      }
    } else if (body.status === 'processing' && mockCurrentOrder.shipment.status === 'pending') {
      const shipmentValidation = validateShipmentStatusUpdate('pending', 'processing');
      if (shipmentValidation.isValid) {
        updatedShipmentStatus = 'processing';
      }
    } else if (body.status === 'delivered' && mockCurrentOrder.shipment.status === 'shipped') {
      const shipmentValidation = validateShipmentStatusUpdate('shipped', 'delivered');
      if (shipmentValidation.isValid) {
        updatedShipmentStatus = 'delivered';
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedOrder = {
      ...mockCurrentOrder,
      status: body.status,
      updated_at: new Date().toISOString(),
      shipment: {
        ...mockCurrentOrder.shipment,
        status: updatedShipmentStatus,
        updated_at: new Date().toISOString(),
        ...(body.status === 'shipped' && {
          tracking_number: `TRK${Date.now()}${orderId}`,
          shipped_at: new Date().toISOString()
        }),
        ...(body.status === 'delivered' && {
          delivered_at: new Date().toISOString()
        }),
        ...(body.status === 'cancelled' && {
          cancelled_at: new Date().toISOString()
        })
      }
    };

    return NextResponse.json({
      message: 'Η κατάσταση της παραγγελίας ενημερώθηκε επιτυχώς',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Σφάλμα ενημέρωσης κατάστασης παραγγελίας:', error);
    return NextResponse.json(
      { error: 'Εσωτερικό σφάλμα διακομιστή' },
      { status: 500 }
    );
  }
}