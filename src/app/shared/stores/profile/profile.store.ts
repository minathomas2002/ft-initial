import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { RoleService } from "../../services/role/role-service";
import { ERoles } from "../../enums";
import { ProfileApiService } from "../../api/profile/profile-api.service";
import { IBaseApiResponse, IProfileResponse, IUpdatePersonalInfoRequest, IUpdateSignatureRequest } from "../../interfaces";
import { finalize, Observable, tap } from "rxjs";
import { AuthStore } from "../auth/auth.store";

const initialState: {
  loading: boolean;
  userProfile: IProfileResponse | null;
  signatureProcessing: boolean;
  personalInfoProcessing: boolean;
} = {
  loading: false,
  userProfile: null,
  signatureProcessing: false,
  personalInfoProcessing: false,
}
export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const roleService = inject(RoleService);
    const authStore = inject(AuthStore);
    return {
      isInvestor: roleService.hasAnyRoleSignal([ERoles.INVESTOR]),
      userImage: computed(() => store.userProfile()?.photo ?? 'assets/images/user_placeholder.svg'),
      userSignature: computed(() => store.userProfile()?.signature ?? null),
      userTitle: computed(() => roleService.hasAnyRoleSignal([ERoles.INVESTOR])() ? authStore.userProfile()?.investorCode : authStore.userProfile()?.roleNames[0]),
      userID: computed(() => authStore.userProfile()?.employeeID ?? ''),
      RoleName: computed(() => authStore.userProfile()?.roleNames[0] ?? ''),
    }
  }),
  withMethods((store) => {
    const profileApiService = inject(ProfileApiService);

    return {
      getUserProfile() {
        patchState(store, { loading: true });
        return profileApiService.getUserProfile().pipe(
          tap((res) => {
            patchState(store, { userProfile: res.body });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      updateSignature(request: IUpdateSignatureRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { signatureProcessing: true });
        return profileApiService.updateSignature(request).pipe(
          finalize(() => {
            patchState(store, { signatureProcessing: false });
          })
        );
      },

      updatePersonalInfo(request: IUpdatePersonalInfoRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { personalInfoProcessing: true });
        return profileApiService.updatePersonalInfo(request).pipe(
          finalize(() => {
            patchState(store, { personalInfoProcessing: false });
          })
        );
      }
    };
  })
);