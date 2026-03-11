import {
  type HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';
import { I18nService } from '../../../shared/services/i18n/i18n.service';
import { DelegationCanceledService } from '../../../shared/services/delegation-canceled/delegation-canceled.service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { DELEGATION_CANCELED_STATUS } from '../../../shared/constants/http-status.constants';

const isTranslationRequest = (url: string): boolean => {
  return url.includes('/assets/i18n/');
};

/**
 * Interceptor to handle errors from the API by display error messages in toaster.
 * It handles both success and error responses from the API.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (isTranslationRequest(req.url)) {
    return next(req);
  }

  const toaster = inject(ToasterService);
  const i18n = inject(I18nService);
  const delegationCanceledService = inject(DelegationCanceledService);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    switchMap((response) => {
      const body = (response as { body?: unknown })?.body ?? response;
      const apiBody = body as { success?: boolean; statusCode?: number; message?: string; errors?: string[] };
      if (apiBody?.success === false) {
        if (
          apiBody?.statusCode === DELEGATION_CANCELED_STATUS &&
          authStore.isImpersonating()
        ) {
          delegationCanceledService.show();
          return throwError(() => apiBody);
        }
        if (apiBody?.statusCode === DELEGATION_CANCELED_STATUS) {
          toaster.error(apiBody.message ?? '');
          return throwError(() => apiBody);
        }
        apiBody?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
        return throwError(() => apiBody);
      }
      return of(response);
    }),
    catchError((err: HttpErrorResponse | Record<string, unknown>) => {
      const isHttpError = err instanceof HttpErrorResponse;
      const errorBody = isHttpError ? (err as HttpErrorResponse).error : (err as Record<string, unknown>);
      const status = isHttpError ? (err as HttpErrorResponse).status : (errorBody as { statusCode?: number })?.statusCode;
      const errorBodyTyped = errorBody as { statusCode?: number; message?: string; success?: boolean; errors?: string[] };
      if (
        (status === DELEGATION_CANCELED_STATUS ||
          errorBodyTyped?.statusCode === DELEGATION_CANCELED_STATUS) &&
        authStore.isImpersonating()
      ) {
        delegationCanceledService.show();
      }
      else if (errorBodyTyped?.statusCode === DELEGATION_CANCELED_STATUS && !authStore.isImpersonating()) {
        toaster.error(errorBodyTyped.message ?? '');
      }
      else if (errorBodyTyped?.success === false) {
        errorBodyTyped?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
      } else if (status === 403) {
        toaster.error(i18n.translate('common.errors.unauthorized'));
      } else if (status === 413) {
        toaster.error(i18n.translate('common.errors.uploadSizeExceeded'));
      } else if (status === 0) {
        toaster.error(i18n.translate('common.errors.serverError'));
      }

      return throwError(() => err);
    })
  );
};
