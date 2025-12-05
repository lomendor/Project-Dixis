// Admin Pricing API utilities
export interface ProductWithProducer {
  id: number;
  name: string;
  price: number;
  stock: number;
  producer: {
    id: number;
    name: string;
  };
}

export interface ProductUpdateData {
  price: number;
  stock: number;
}

export const pricingApi = {
  async getProducts(): Promise<ProductWithProducer[]> {
    const response = await fetch('/api/v1/products?with=producer');
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async updateProduct(productId: number, updates: ProductUpdateData): Promise<void> {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }
};