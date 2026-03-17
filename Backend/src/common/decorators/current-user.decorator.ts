import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { UserPayload } from '../../auth/interfaces/jwt-payload.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserPayload }>();
    return request.user;
  },
);
