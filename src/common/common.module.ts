import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

/**
 * Módulo Comum (Global)
 * Recursos compartilhados disponíveis em toda aplicação
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    HttpExceptionFilter,
    TransformInterceptor,
    LoggingInterceptor,
  ],
  exports: [
    HttpExceptionFilter,
    TransformInterceptor,
    LoggingInterceptor,
  ],
})
export class CommonModule {}
