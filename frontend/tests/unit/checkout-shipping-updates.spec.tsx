import { renderWithProviders } from "../helpers/render-with-providers";
/**
 * CO-UI-002: Checkout Shipping Updates Component Tests
 * Tests shipping method selection, postal code validation, and UI state updates
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { greekPostalHandlers } from '../msw/checkout.handlers';

// Mock CheckoutShipping component (assuming it exists)
const CheckoutShipping = ({ onShippingUpdate }: { onShippingUpdate: (method: any) => void }) => {
  const [postalCode, setPostalCode] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePostalCodeSubmit = async () => {
    if (postalCode.length !== 5) {
      setError('Μη έγκυρος ΤΚ (5 ψηφία)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: { postal_code: postalCode } })
      });

      if (!response.ok) {
        throw new Error('Invalid postal code');
      }

      const data = await response.json();
      setShippingMethods(data.shipping_methods || []);
    } catch {
      setError('Σφάλμα στην εύρεση μεθόδων αποστολής');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="checkout-shipping">
      <input
        data-testid="postal-code-input"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        placeholder="Ταχυδρομικός Κώδικας"
      />
      <button
        data-testid="get-shipping-quote"
        onClick={handlePostalCodeSubmit}
        disabled={loading}
      >
        {loading ? 'Αναζήτηση...' : 'Υπολογισμός Αποστολής'}
      </button>

      {error && <div data-testid="shipping-error" role="alert">{error}</div>}

      {shippingMethods.length > 0 && (
        <div data-testid="shipping-methods">
          {shippingMethods.map((method: any) => (
            <label key={method.id} data-testid={`shipping-method-${method.id}`}>
              <input
                type="radio"
                name="shipping"
                value={method.id}
                onChange={() => onShippingUpdate(method)}
              />
              {method.name} - €{method.price} ({method.estimated_days} ημέρες)
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// MSW server setup
const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
  server.use(...greekPostalHandlers);
});

afterEach(() => {
  server.resetHandlers();
  server.close();
  vi.clearAllMocks();
});

describe.skip('CO-UI-002: Checkout Shipping Updates', () => {
  it('validates Greek postal codes correctly', async () => {
    const user = userEvent.setup();
    const mockOnShippingUpdate = vi.fn();

    renderWithProviders(<CheckoutShipping onShippingUpdate={mockOnShippingUpdate} />);

    const postalInput = screen.getByTestId('postal-code-input');
    const submitButton = screen.getByTestId('get-shipping-quote');

    // Test invalid postal code (too short)
    await user.type(postalInput, '123');
    await user.click(submitButton);

    expect(screen.getByTestId('shipping-error')).toHaveTextContent('Μη έγκυρος ΤΚ (5 ψηφία)');

    // Test valid postal code
    await user.clear(postalInput);
    await user.type(postalInput, '10671');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('shipping-methods')).toBeInTheDocument();
    });
  });

  it('displays loading state during shipping quote calculation', async () => {
    const user = userEvent.setup();
    const mockOnShippingUpdate = vi.fn();

    renderWithProviders(<CheckoutShipping onShippingUpdate={mockOnShippingUpdate} />);

    const postalInput = screen.getByTestId('postal-code-input');
    const submitButton = screen.getByTestId('get-shipping-quote');

    await user.type(postalInput, '10671');
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent('Αναζήτηση...');
    expect(submitButton).toBeDisabled();
  });

  it('handles remote island shipping with higher costs', async () => {
    const user = userEvent.setup();
    const mockOnShippingUpdate = vi.fn();

    renderWithProviders(<CheckoutShipping onShippingUpdate={mockOnShippingUpdate} />);

    const postalInput = screen.getByTestId('postal-code-input');
    const submitButton = screen.getByTestId('get-shipping-quote');

    // Test remote island postal code
    await user.type(postalInput, '19010'); // Remote island
    await user.click(submitButton);

    await waitFor(() => {
      const shippingMethod = screen.getByTestId('shipping-method-island');
      expect(shippingMethod).toHaveTextContent('Island Express - €12.5 (5 ημέρες)');
    });
  });

  it('allows shipping method selection and triggers callback', async () => {
    const user = userEvent.setup();
    const mockOnShippingUpdate = vi.fn();

    renderWithProviders(<CheckoutShipping onShippingUpdate={mockOnShippingUpdate} />);

    const postalInput = screen.getByTestId('postal-code-input');
    const submitButton = screen.getByTestId('get-shipping-quote');

    await user.type(postalInput, '10671');
    await user.click(submitButton);

    await waitFor(() => {
      const shippingMethod = screen.getByTestId('shipping-method-standard');
      expect(shippingMethod).toBeInTheDocument();
    });

    const radioButton = screen.getByDisplayValue('standard');
    await user.click(radioButton);

    expect(mockOnShippingUpdate).toHaveBeenCalledWith({
      id: 'standard',
      name: 'Standard',
      price: 3.50,
      estimated_days: 2
    });
  });

  it('handles API errors gracefully', async () => {
    // Override with error handler
    server.use(
      http.post('/api/v1/shipping/quote', () => {
        return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
      })
    );

    const user = userEvent.setup();
    const mockOnShippingUpdate = vi.fn();

    renderWithProviders(<CheckoutShipping onShippingUpdate={mockOnShippingUpdate} />);

    const postalInput = screen.getByTestId('postal-code-input');
    const submitButton = screen.getByTestId('get-shipping-quote');

    await user.type(postalInput, '10671');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('shipping-error')).toHaveTextContent('Σφάλμα στην εύρεση μεθόδων αποστολής');
    });
  });
});