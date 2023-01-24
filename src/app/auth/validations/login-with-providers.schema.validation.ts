import * as JoiBase from 'joi';

import { CreateSchema } from '@app/@common/application/validators/joi/schemas/joi.create-schema.interface';
import joiMessagesSchema from '@app/@common/application/validators/joi/schemas/joi.messages.schema';

const Joi = JoiBase;

export class LoginWithProvidersSchema implements CreateSchema {
  createSchema(): JoiBase.ObjectSchema {
    return Joi.object({
      accessToken: Joi.string()
        .required()
        .label('Access Token')
        .messages(joiMessagesSchema),
      idToken: Joi.string().label('ID Token').messages(joiMessagesSchema),
      deviceToken: Joi.string()
        .label('Device Token')
        .messages(joiMessagesSchema),
    });
  }
}
