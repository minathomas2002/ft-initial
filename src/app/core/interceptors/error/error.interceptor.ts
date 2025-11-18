import { type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';
import { IBaseApiResponse } from 'src/app/shared/interfaces/api.interface';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  return next(req).pipe(
    tap((response: any) => {
      const responseBody = response as IBaseApiResponse<unknown>;
      if (response instanceof HttpResponse && !responseBody.success) {
        toaster.error(
          responseBody.message || 'failed to process ,check your internet connection',
        );
      }
    }),
  );
};
