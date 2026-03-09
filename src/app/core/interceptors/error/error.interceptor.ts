import {
  type HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';
import { DelegationCanceledService } from '../../../shared/services/delegation-canceled/delegation-canceled.service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { DELEGATION_CANCELED_STATUS } from '../../../shared/constants/http-status.constants';

/**
 * Interceptor to handle errors from the API by display error messages in toaster.
 * It handles both success and error responses from the API.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
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
        toaster.error(
          'You are not authorized to access this resource or your user is not active'
        );
      } else if (status === 413) {
        toaster.error('The maximum allowed upload size is 30 MB');
      } else if (status === 0) {
        toaster.error(
          'You are facing an issue with the server. Please try again later.'
        );
      }

      return throwError(() => err);
    })
  );
};
