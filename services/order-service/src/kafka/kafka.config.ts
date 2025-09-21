import { OrderStatus } from 'src/order/entities/order.entity';

export const KAFKA_CONFIG = {
  clientId: 'order-service',
  brokers: ['localhost:9092'],
  groupId: 'order-service-group',
};

export const KAFKA_TOPICS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.deleted',
};

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}

export interface OrderCancelledEvent {
  orderId: string;
  reason: string;
  cancelledAt: string;
}
