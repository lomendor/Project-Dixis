import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/payment-providers';

/**
 * POST /api/checkout/pay
 * Processes payment and finalizes the order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod: _paymentMethod, paymentToken } = body;

    // Mock authentication
    const userToken = request.headers.get('authorization');
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock: Get current draft order
    // In real app: SELECT * FROM orders WHERE user_id = ? AND status = 'draft'
    const draftOrder = await getMockDraftOrder();

    if (!draftOrder) {
      return NextResponse.json(
        { error: 'Δεν βρέθηκε ενεργή παραγγελία για επεξεργασία' },
        { status: 404 }
      );
    }

    // Validate order has required information
    if (!draftOrder.shippingAddress) {
      return NextResponse.json(
        { error: 'Η διεύθυνση αποστολής είναι υποχρεωτική' },
        { status: 400 }
      );
    }

    if (!draftOrder.items || draftOrder.items.length === 0) {
      return NextResponse.json(
        { error: 'Το καλάθι είναι άδειο' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const subtotal = draftOrder.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
    const shippingCost = draftOrder.shippingCost || 0;
    const totalAmount = subtotal + shippingCost;
    const totalAmountCents = Math.round(totalAmount * 100);

    // Generate order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Initialize payment
      const _paymentInit = await paymentManager.initPayment(orderId, totalAmountCents, 'EUR');

      // Confirm payment
      const paymentResult = await paymentManager.confirmPayment(orderId, paymentToken);

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: paymentResult.error || 'Η πληρωμή απέτυχε' },
          { status: 400 }
        );
      }

      // Mock: Create final order record
      const finalOrder = await createFinalOrder(orderId, draftOrder, paymentResult);

      // Mock: Create shipment record
      const shipment = await createShipmentRecord(orderId, draftOrder);

      return NextResponse.json({
        success: true,
        orderId: finalOrder.id,
        transactionId: paymentResult.transactionId,
        order: {
          id: finalOrder.id,
          status: finalOrder.status,
          total: finalOrder.total,
          currency: finalOrder.currency,
        },
        shipment: {
          id: shipment.id,
          status: shipment.status,
          trackingNumber: shipment.trackingNumber,
        },
        message: 'Η παραγγελία ολοκληρώθηκε επιτυχώς!',
      });

    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return NextResponse.json(
        { error: 'Σφάλμα κατά την επεξεργασία της πληρωμής' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Checkout payment error:', error);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ολοκλήρωση της παραγγελίας' },
      { status: 500 }
    );
  }
}

/**
 * Mock function to get current draft order
 */
async function getMockDraftOrder() {
  // In real app: Database query for draft order
  return {
    id: 'draft-order-123',
    userId: 'user-123',
    status: 'draft',
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Βιολογικές Ντομάτες Κρήτης',
        price: 3.50,
        quantity: 2,
        weightGrams: 2000,
      },
      {
        id: 2,
        productId: 2,
        name: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
        price: 12.80,
        quantity: 1,
        weightGrams: 500,
      },
    ],
    shippingAddress: {
      name: 'Δημήτρης Παπαδόπουλος',
      line1: 'Βασιλίσσης Σοφίας 123',
      city: 'Αθήνα',
      postalCode: '10671',
      country: 'GR',
      phone: '+30 210 1234567',
    },
    shippingCost: 4.50,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Mock function to create final order
 */
async function createFinalOrder(orderId: string, draftOrder: any, paymentResult: any) {
  // In real app: Insert into orders table
  const subtotal = draftOrder.items.reduce(
    (sum: number, item: any) => sum + (item.price * item.quantity),
    0
  );
  const total = subtotal + draftOrder.shippingCost;

  return {
    id: orderId,
    userId: draftOrder.userId,
    status: 'paid',
    subtotal,
    shippingCost: draftOrder.shippingCost,
    total,
    currency: 'EUR',
    shippingAddress: draftOrder.shippingAddress,
    items: draftOrder.items,
    paymentId: paymentResult.transactionId,
    paymentProvider: paymentResult.metadata?.provider || 'unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mock function to create shipment record
 */
async function createShipmentRecord(orderId: string, draftOrder: any) {
  // In real app: Insert into shipments table
  const shipmentId = `SHIP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const trackingNumber = `EL${Date.now().toString().slice(-8)}`;

  return {
    id: shipmentId,
    orderId,
    status: 'pending',
    trackingNumber,
    carrier: 'ΕΛΤΑ Courier',
    shippingCost: draftOrder.shippingCost,
    shippingAddress: draftOrder.shippingAddress,
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}