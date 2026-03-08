import {
  type HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
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
    tap((response: any) => {
      const body = response?.body ?? response;
      if (body?.success === false) {
        if (
          body?.statusCode === DELEGATION_CANCELED_STATUS &&
          authStore.isImpersonating()
        ) {
          delegationCanceledService.show();
        } else {
          body?.errors?.forEach((error: string) => {
            toaster.error(error);
          });
        }
      }
    }),
    catchError((response: HttpErrorResponse) => {
      const errorBody = response.error;
      if (
        (response.status === DELEGATION_CANCELED_STATUS ||
          errorBody?.statusCode === DELEGATION_CANCELED_STATUS) &&
        authStore.isImpersonating()
      ) {
        delegationCanceledService.show();
      } else if (errorBody?.success === false) {
        errorBody?.errors?.forEach((error: string) => {
          toaster.error(error);
        });
      } else if (response.status === 403) {
        toaster.error(
          'You are not authorized to access this resource or your user is not active'
        );
      } else if (response.status === 413) {
        toaster.error('The maximum allowed upload size is 30 MB');
      } else if (response.status === 0) {
        toaster.error(
          'You are facing an issue with the server. Please try again later.'
        );
      }

      return throwError(() => response);
    })
  );
};
