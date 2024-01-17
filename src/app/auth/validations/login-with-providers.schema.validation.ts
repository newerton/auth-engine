import { z } from 'zod';

import { CreateValidationSchema } from '@app/@common/application/validators/zod/schemas';

export class LoginWithProvidersSchema implements CreateValidationSchema {
  createSchema(): z.ZodSchema {
    return z.object({
      accessToken: z.string({
        description: 'Access Token',
        invalid_type_error: 'Access Token must be a string',
        required_error: 'Access Token is required',
      }),
      idToken: z.string({
        description: 'ID Token',
        invalid_type_error: 'ID Token must be a string',
        required_error: 'ID Token is required',
      }),
      deviceToken: z.string({
        description: 'Device Token',
        invalid_type_error: 'Device Token must be a string',
        required_error: 'Device Token is required',
      }),
    });
  }
}
