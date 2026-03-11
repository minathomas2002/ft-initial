import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, map, tap, throwError } from 'rxjs';
import {
  ActiveEmployee,
  IAddDelegationRequest,
  IDelegationFilterRequest,
  IDelegationRecord,
  IEditDelegationRequest,
} from '../../interfaces/delegation.interface';
import { ContactUsApiService } from '../../api/contact-us/contact-us-service';
import { IAddContactUsRequest } from '../../interfaces/contact-us.interface';
import { I18nService } from '../../services/i18n/i18n.service';

const initialState: {
  isLoading: boolean;
  isLoadingDetails: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: IDelegationRecord[];
  activeEmployees: ActiveEmployee[];
} = {
  isLoading: false,
  isLoadingDetails: false,
  isProcessing: false,
  error: null,
  count: 0,
  list: [],
  activeEmployees: [],
};
export const ContactUsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const contactUsApiService = inject(ContactUsApiService);
    const i18n = inject(I18nService);
    return {

      addContactUsMessage(request: IAddContactUsRequest) {
        patchState(store, { isProcessing: true, error: null });
        return contactUsApiService.add(request).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            return throwError(() => new Error(error.errorMessage || i18n.translate('contactUs.errors.addMessage')));
          }),
        );
      },





    };
  }),
  withMethods((store) => {
    return {};
  }),
);
