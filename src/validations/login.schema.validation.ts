import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

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
        .messages(MessagesSchema),
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
        .messages(MessagesSchema),
      deviceToken: Joi.string()
        .label('Device Token')
        .error((errors: any) => {
          errors.forEach((err: any) => {
            console.log('Validation', err.code, err.local as any);
          });
          return errors;
        })
        .messages(MessagesSchema),
    });
  }
}
