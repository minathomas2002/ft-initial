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
import { I18nService } from '../../../shared/services/i18n/i18n.service';
/**
 * Interceptor to handle errors from the API by display error messages in toaster.
 * It handles both success and error responses from the API.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  const i18n = inject(I18nService);
  return next(req).pipe(
    tap((response: any) => {
      if (response?.body?.success === false) {
        response?.body?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
      }
    }),
    catchError((response: HttpErrorResponse) => {
      if (response.error?.success === false) {
        response.error?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
      } else if (response.status === 403) {
        toaster.error(i18n.translate('common.errors.unauthorized'));
      } else if (response.status === 413) {
        toaster.error(i18n.translate('common.errors.uploadSizeExceeded'));
      } else if (response.status === 0) {
        toaster.error(i18n.translate('common.errors.serverError'));
      }

      return throwError(() => response);
    })
  );
};
