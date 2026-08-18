import { ApiClient } from './ApiClient';
import { endpoints } from './endpoints';
import { Order, OrderItem, Recipient } from './types';

/** Order creation, listing and cleanup. */
export class OrderApi {
  constructor(private readonly client: ApiClient) {}

  async placeOrder(
    items: OrderItem[],
    recipient: Recipient,
    paymentMethod = 'cash',
  ): Promise<Order> {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.client.postJson<Order>(endpoints.orders.create, {
      items,
      ...recipient,
      paymentMethod,
      totalPrice,
    });
  }

  async listOrders(): Promise<Order[]> {
    const response = await this.client.get<Order[] | { orders: Order[] }>(endpoints.orders.list);
    // The list endpoint is paginated, so it may wrap the array in an object.
    return Array.isArray(response) ? response : response.orders;
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.client.deleteIfExists(endpoints.orders.byId(orderId));
  }

  /** Removes every order for the current user, used to reset state. */
  async deleteAllOrders(): Promise<void> {
    await this.client.deleteIfExists(endpoints.orders.all);
  }
}
