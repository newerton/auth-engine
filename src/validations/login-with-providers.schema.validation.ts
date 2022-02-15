import * as JoiBase from 'joi';
import { CreateSchema } from 'src/schemas/joi.create.schema.factory';
import MessagesSchema from 'src/schemas/joi.messages.schema';

const Joi = JoiBase;

export class LoginWithProvidersSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      accessToken: Joi.string()
        .required()
        .label('Access Token')
        .messages(MessagesSchema),
      idToken: Joi.string().label('ID Token').messages(MessagesSchema),
      deviceToken: Joi.string().label('Device Token').messages(MessagesSchema),
    });
  }
}
