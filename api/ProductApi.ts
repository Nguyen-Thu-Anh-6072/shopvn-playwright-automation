import { ApiClient } from './ApiClient';
import { endpoints } from './endpoints';
import { Product } from './types';

/**
 * Reading the catalogue through the API keeps the tests honest: they act on
 * whatever the backend actually serves instead of hard-coded product names
 * that quietly rot when the catalogue changes.
 */
export class ProductApi {
  constructor(private readonly client: ApiClient) {}

  async listProducts(): Promise<Product[]> {
    const response = await this.client.get<Product[] | { products: Product[] }>(
      endpoints.products.list,
    );
    return Array.isArray(response) ? response : response.products;
  }

  async getFirstProduct(): Promise<Product> {
    const products = await this.listProducts();
    if (products.length === 0) {
      throw new Error('Product catalogue is empty; cannot pick a product for the test.');
    }
    return products[0];
  }
}
