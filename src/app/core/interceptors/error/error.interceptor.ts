import { type HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  return next(req).pipe(
    
    catchError((response: HttpErrorResponse) => {
      debugger;
      if (response instanceof HttpErrorResponse) {
        if (response.error.success === false && response.error.errors) {
          response.error.errors?.forEach((error: string) => {
            toaster.error(error);
          });          
        }
      }      
      return throwError(() => response);
    }),
  );
};
