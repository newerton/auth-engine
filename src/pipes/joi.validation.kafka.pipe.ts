import { PipeTransform, Injectable } from '@nestjs/common';
import { KafkaMessage } from '@nestjs/microservices/external/kafka.interface';

import * as JoiBase from 'joi';
import { JoiValidationException } from 'src/app.exceptions';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';

@Injectable()
export class JoiValidationKafkaPipe implements PipeTransform {
  private readonly schema: JoiBase.AnySchema;

  constructor(private schemaFactory: CreateSchema) {
    this.schema = schemaFactory.createSchema();
  }

  async transform(
    message: KafkaMessage,
  ): Promise<KafkaMessage | Buffer | null> {
    const { value } = message;
    try {
      await this.schema.validateAsync(value);
    } catch (err) {
      const errors = {
        message: err?.message || err,
        details: err?.details,
      };
      throw new JoiValidationException(errors);
    }

    return message;
  }
}
