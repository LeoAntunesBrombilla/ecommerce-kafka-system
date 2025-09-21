import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCreatedEvent, OrderUpdatedEvent } from 'src/kafka/kafka.config';

@Injectable()
export class OrderService {
  private orders: Map<string, Order> = new Map();

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    //TODO improve the id, and use real db
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new Order({
      id: orderId,
      customerId: createOrderDto.customerId,
      items: createOrderDto.items,
      totalAmount,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.orders.set(orderId, order);

    const orderCreatedEvent: OrderCreatedEvent = {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toString(),
    };

    await this.kafkaProducer.publishOrderCreatedEvent(orderCreatedEvent);
    console.log(
      `✅ Order created: ${orderId} for customer: ${order.customerId}`,
    );
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    const order = this.orders.get(orderId);
    if (!order) {
      console.warn(`⚠️ Order not found: ${orderId}`);
      return null;
    }

    order.status = status;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);

    const orderUpdatedEvent: OrderUpdatedEvent = {
      orderId: order.id,
      status: order.status,
      updatedAt: order.updatedAt.toString(),
    };

    await this.kafkaProducer.publishOrderUpdated(orderUpdatedEvent);
    console.log(`✅ Order updated: ${orderId} to status: ${status}`);
    return order;
  }

  getOrder(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return order;
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }
}
