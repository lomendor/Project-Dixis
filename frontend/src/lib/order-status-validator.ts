export type OrderStatus = 'draft' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  pending: ['processing', 'shipped'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: []
};

export function isValidOrderStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

export function isValidShipmentStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): boolean {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

export function getValidOrderStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus];
}

export function getValidShipmentStatusTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus];
}

export function validateOrderStatusUpdate(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { isValid: boolean; error?: string } {
  if (!isValidOrderStatusTransition(currentStatus, newStatus)) {
    return {
      isValid: false,
      error: `Η μετάβαση από "${currentStatus}" σε "${newStatus}" δεν επιτρέπεται`
    };
  }
  return { isValid: true };
}

export function validateShipmentStatusUpdate(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): { isValid: boolean; error?: string } {
  if (!isValidShipmentStatusTransition(currentStatus, newStatus)) {
    return {
      isValid: false,
      error: `Η μετάβαση από "${currentStatus}" σε "${newStatus}" δεν επιτρέπεται`
    };
  }
  return { isValid: true };
}