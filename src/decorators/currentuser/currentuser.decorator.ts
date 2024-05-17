import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../user/user.entity';

export const CurrentUser = createParamDecorator((data: string, request: ExecutionContext): User => {
  const req = request.switchToHttp().getRequest();
  return req.user;
});
