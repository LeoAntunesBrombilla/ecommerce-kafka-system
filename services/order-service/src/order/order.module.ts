import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, KafkaProducerService],
  exports: [OrderService, KafkaProducerService],
})
export class OrderModule {}
