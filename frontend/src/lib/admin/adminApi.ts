// Admin API utilities for product management
export interface ProductWithProducer {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  producer: {
    id: number;
    name: string;
  };
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const adminApi = {
  async getProducts(): Promise<ProductWithProducer[]> {
    const response = await fetch('/api/v1/products?with=producer');
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async toggleProductStatus(productId: number, isActive: boolean): Promise<void> {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update product status');
    }
  }
};