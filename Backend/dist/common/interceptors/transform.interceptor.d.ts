import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface TransformedResponse<T> {
    data: T;
    statusCode: number;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, TransformedResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<TransformedResponse<T>>;
}
