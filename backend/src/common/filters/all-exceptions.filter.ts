import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseContent =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let errorMessage: any;
    let errorDetail: any = null;

    if (typeof responseContent === 'object' && responseContent !== null) {
      errorMessage = (responseContent as any).message || 'An error occurred';
      errorDetail = (responseContent as any).error || null;
    } else {
      errorMessage = responseContent || 'An error occurred';
    }

    // Log the exception stack or content internally
    if (status >= 500) {
      this.logger.error(
        `[500 Server Error] Path: ${request.url} | Error: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `[HTTP Warning] Status: ${status} | Path: ${request.url} | Message: ${JSON.stringify(errorMessage)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
      error: errorDetail || (status >= 500 ? 'Internal Server Error' : 'Bad Request'),
    });
  }
}
