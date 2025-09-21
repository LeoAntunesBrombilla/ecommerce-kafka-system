import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCreatedEvent, OrderUpdatedEvent } from 'src/kafka/kafka.config';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  private orders: Map<string, Order> = new Map();

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.create(createOrderDto);

    const orderCreatedEvent: OrderCreatedEvent = {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toString(),
    };

    await this.kafkaProducer.publishOrderCreatedEvent(orderCreatedEvent);
    console.log(
      `✅ Order created: ${order.id} for customer: ${order.customerId}`,
    );
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    const order = await this.orderRepository.updateStatus(orderId, status);
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

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
