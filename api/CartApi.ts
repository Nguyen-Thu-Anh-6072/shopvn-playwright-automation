import { ApiClient } from './ApiClient';
import { endpoints } from './endpoints';
import { OrderItem } from './types';

/**
 * Server-synced cart.
 *
 * The cart endpoint overwrites the whole basket, which makes resetting state
 * a single call: writing an empty list is the cleanest way to empty the cart.
 */
export class CartApi {
  constructor(private readonly client: ApiClient) {}

  async getItems(): Promise<OrderItem[]> {
    return this.client.get<OrderItem[]>(endpoints.cart.current);
  }

  async setItems(items: OrderItem[]): Promise<void> {
    await this.client.putJson(endpoints.cart.current, { items });
  }

  async clear(): Promise<void> {
    await this.setItems([]);
  }

  /** Quantity of one product, or zero when it is not in the cart. */
  async quantityOf(productId: string): Promise<number> {
    const items = await this.getItems();
    return items.find((item) => item.productId === productId)?.quantity ?? 0;
  }
}
