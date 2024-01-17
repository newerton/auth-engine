import { z } from 'zod';

import { CreateValidationSchema } from '@app/@common/application/validators/zod/schemas';

export class LoginSchema implements CreateValidationSchema {
  createSchema(): z.ZodSchema {
    return z.object({
      email: z
        .string({
          description: 'E-mail',
          invalid_type_error: 'E-mail must be a string',
          required_error: 'E-mail is required',
        })
        .toLowerCase()
        .email(),
      password: z
        .string({
          description: 'Password',
          invalid_type_error: 'Password must be a string',
          required_error: 'Password is required',
        })
        .min(6)
        .max(30),
      deviceToken: z.string({
        description: 'Device Token',
        invalid_type_error: 'Device Token must be a string',
        required_error: 'Device Token is required',
      }),
    });
  }
}
