import { Controller } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

@Controller()
export class AuthController {
  @EventPattern('product_created', Transport.KAFKA)
  async handleProductCreated(data: Record<string, unknown>) {
    console.log('product_created');
    console.log(data);
  }
}
