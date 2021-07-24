import { CustomError } from 'ts-custom-error';

class UserError extends CustomError {
  constructor(message: string) {
    super(message);
  }
}

export default UserError;
