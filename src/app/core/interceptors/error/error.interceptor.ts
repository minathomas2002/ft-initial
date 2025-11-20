import { type HttpInterceptorFn, HttpResponse, HttpEvent } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';
import { IBaseApiResponse } from 'src/app/shared/interfaces';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  return next(req).pipe(
    tap((response: HttpEvent<unknown>) => {
      if (response instanceof HttpResponse) {
        const body = response.body as IBaseApiResponse<unknown> | null;
        if (body?.success === false) {
          body.message.forEach((message: string) => {
            toaster.error(message);
          });
        }
      }
    }),
  );
};
