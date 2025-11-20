import {
  type HttpInterceptorFn,
  HttpResponse,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  return next(req).pipe(
    catchError((response: HttpErrorResponse) => {
      if (response.error?.success === false) {
        response.error?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
      }
      return throwError(() => response);
    })
  );
};
