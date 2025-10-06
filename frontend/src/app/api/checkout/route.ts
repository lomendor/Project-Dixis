import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Το καλάθι είναι άδειο' },
        { status: 400 }
      );
    }

    if (!shipping || !shipping.name || !shipping.line1 || !shipping.city || !shipping.postal) {
      return NextResponse.json(
        { error: 'Η διεύθυνση αποστολής είναι υποχρεωτική' },
        { status: 400 }
      );
    }

    // Get phone from session (mock for now)
    const buyerPhone = request.headers.get('x-buyer-phone') || '+306912345678';

    // Wrap in transaction (oversell-safe)
    const result = await prisma.$transaction(async (tx) => {
      // Validate stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, price: true, producerId: true }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.qty) {
          throw new Error('OVERSALE');
        }
      }

      // Calculate total
      let total = 0;
      const productsMap = new Map();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, producerId: true }
        });
        productsMap.set(item.productId, product);
        total += product!.price * item.qty;
      }

      // Create order
      const order = await tx.order.create({
        data: {
          buyerPhone,
          buyerName: shipping.name,
          shippingLine1: shipping.line1,
          shippingLine2: shipping.line2 || null,
          shippingCity: shipping.city,
          shippingPostal: shipping.postal,
          total,
          status: 'pending'
        }
      });

      // Create order items and decrement stock
      for (const item of items) {
        const product = productsMap.get(item.productId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            producerId: product!.producerId,
            qty: item.qty,
            price: product!.price,
            status: 'pending'
          }
        });

        // Decrement stock (oversell already checked)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } }
        });
      }

      return {
        orderId: order.id,
        total: order.total,
        status: order.status
      };
    });

    return NextResponse.json({
      success: true,
      order: result
    });

  } catch (e: any) {
    if (String(e.message || '').includes('OVERSALE')) {
      return NextResponse.json(
        { error: 'Ανεπαρκές απόθεμα' },
        { status: 409 }
      );
    }
    console.error('Checkout error:', e);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ολοκλήρωση της παραγγελίας' },
      { status: 500 }
    );
  }
}
