import * as JoiBase from 'joi';

import { CreateSchema } from '@app/@common/application/validators/joi/schemas/joi.create-schema.interface';
import joiMessagesSchema from '@app/@common/application/validators/joi/schemas/joi.messages.schema';

const Joi = JoiBase;

export class LoginSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .label('E-mail')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(joiMessagesSchema),
      password: Joi.string()
        .min(6)
        .max(30)
        .required()
        .label('Senha')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(joiMessagesSchema),
      deviceToken: Joi.string()
        .label('Device Token')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(joiMessagesSchema),
    });
  }
}