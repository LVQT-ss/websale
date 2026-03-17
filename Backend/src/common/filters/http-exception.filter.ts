import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

interface PrismaError {
  code?: string;
  meta?: { target?: string[] };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const converted = this.convertPrismaError(exception);
    const finalException = converted ?? exception;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (finalException instanceof HttpException) {
      status = finalException.getStatus();
      const exceptionResponse = finalException.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res['message'] as string | string[]) ?? finalException.message;
        error = (res['error'] as string) ?? '';
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  private convertPrismaError(exception: unknown): HttpException | null {
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const prismaError = exception as PrismaError;

      switch (prismaError.code) {
        case 'P2002': {
          const fields = prismaError.meta?.target?.join(', ') ?? 'field';
          return new ConflictException(
            `A record with this ${fields} already exists`,
          );
        }
        case 'P2025':
          return new NotFoundException('Record not found');
        default:
          return null;
      }
    }

    return null;
  }
}
