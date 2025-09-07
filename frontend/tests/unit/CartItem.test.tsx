/**
 * CartItem Component Unit Tests
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Tests cart item rendering, quantity controls, and remove functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '../../src/components/cart/CartItem';
import type { CartLine } from '../../src/lib/validation/checkout';

const mockItem: CartLine = {
  id: 1,
  product_id: 123,
  name: 'Greek Olive Oil',
  price: 15.50,
  quantity: 2,
  subtotal: 31.00,
  producer_name: 'Cretan Farms'
};

describe('CartItem Component', () => {
  const mockOnQuantityChange = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnQuantityChange.mockClear();
    mockOnRemove.mockClear();
  });

  it('renders cart item with correct product details', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('Greek Olive Oil')).toBeInTheDocument();
    expect(screen.getByText('By Cretan Farms')).toBeInTheDocument();
    expect(screen.getByText('15,50 €')).toBeInTheDocument();
    expect(screen.getByTestId('quantity-display')).toHaveTextContent('2');
  });

  it('handles quantity increase correctly', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />
    );

    const increaseBtn = screen.getByTestId('increase-quantity');
    fireEvent.click(increaseBtn);

    expect(mockOnQuantityChange).toHaveBeenCalledWith(1, 3);
  });

  it('handles quantity decrease correctly', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />
    );

    const decreaseBtn = screen.getByTestId('decrease-quantity');
    fireEvent.click(decreaseBtn);

    expect(mockOnQuantityChange).toHaveBeenCalledWith(1, 1);
  });

  it('handles item removal correctly', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />
    );

    const removeBtn = screen.getByTestId('remove-item');
    fireEvent.click(removeBtn);

    expect(mockOnRemove).toHaveBeenCalledWith(1);
  });

  it('shows updating state correctly', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
        isUpdating={true}
      />
    );

    expect(screen.getByTestId('quantity-display')).toHaveTextContent('...');
    expect(screen.getByTestId('increase-quantity')).toBeDisabled();
    expect(screen.getByTestId('decrease-quantity')).toBeDisabled();
    expect(screen.getByTestId('remove-item')).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <CartItem
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove item from cart')).toBeInTheDocument();
  });
});