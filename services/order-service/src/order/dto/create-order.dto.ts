export class CreateOrderDto {
  customerId: string;
  items: OrderItemDto[];
}

export class OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}
