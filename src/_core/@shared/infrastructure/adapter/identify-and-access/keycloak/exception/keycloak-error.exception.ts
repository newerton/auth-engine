import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

export class KeycloakUseCaseException {
  constructor(private readonly error: any) {
    this.execute();
  }

  execute() {
    if (this.error.response) {
      const errorResponse = this.error.response;
      if (errorResponse.status === 409) {
        throw Exception.new({
          code: Code.CONFLICT,
          overrideMessage: errorResponse.data.errorMessage,
        });
      }

      if (errorResponse?.data?.errorMessage) {
        throw Exception.new({
          code: Code.BAD_REQUEST,
          overrideMessage: errorResponse.data.errorMessage,
        });
      }
    }

    if (this.error.getError()) {
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: this.error.getError(),
      });
    }

    throw Exception.new({
      code: Code.UNAUTHORIZED,
      overrideMessage: this.error,
    });
  }
}
