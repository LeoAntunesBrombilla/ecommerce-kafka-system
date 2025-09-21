import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import {
  KAFKA_CONFIG,
  KAFKA_TOPICS,
  OrderCreatedEvent,
  OrderUpdatedEvent,
} from './kafka.config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka(KAFKA_CONFIG);
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log('Kafka Producer disconneted');
  }

  async publishOrderCreatedEvent(order: OrderCreatedEvent) {
    try {
      await this.producer.send({
        topic: KAFKA_TOPICS.ORDER_CREATED,
        messages: [
          {
            key: order.orderId,
            value: JSON.stringify(order),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log('Order created event published', order.orderId);
    } catch (error) {
      console.error('Error publishing order created event', error);
      throw error;
    }
  }

  async publishOrderUpdated(order: OrderUpdatedEvent) {
    try {
      await this.producer.send({
        topic: KAFKA_TOPICS.ORDER_UPDATED,
        messages: [
          {
            key: order.orderId,
            value: JSON.stringify(order),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log('Order updated event published', order.orderId);
    } catch (error) {
      console.error('Error publishing order updated event', error);
      throw error;
    }
  }

  async publish(topic: string, key: string, message: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
  }
}
