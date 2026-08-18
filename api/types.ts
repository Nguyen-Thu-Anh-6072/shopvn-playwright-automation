export interface Credentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResult {
  token: string;
  user: UserProfile;
}

/** A registered account plus the token needed to act as that user. */
export interface TestAccount extends Credentials {
  id: string;
  name: string;
  token: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  emoji?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
}

export interface Order {
  id: string;
  _id?: string;
  userId: string;
  items: OrderItem[];
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Recipient {
  recipientName: string;
  recipientPhone: string;
  address: string;
}
