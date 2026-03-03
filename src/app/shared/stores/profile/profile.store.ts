import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { RoleService } from "../../services/role/role-service";
import { ERoles } from "../../enums";
import { ProfileApiService } from "../../api/profile/profile-api.service";
import { AuthApiService } from "../../api/auth/auth-api-service";
import { IBaseApiResponse, IChangePasswordRequest, IProfileResponse, IUpdatePersonalInfoRequest, IUpdateProfilePicRequest, IUpdateSignatureRequest } from "../../interfaces";
import { finalize, Observable, tap } from "rxjs";
import { AuthStore } from "../auth/auth.store";

const initialState: {
  loading: boolean;
  userProfile: IProfileResponse | null;
  signatureProcessing: boolean;
  personalInfoProcessing: boolean;
  profilePictureProcessing: boolean;
  changePasswordProcessing: boolean;
} = {
  loading: false,
  userProfile: null,
  signatureProcessing: false,
  personalInfoProcessing: false,
  profilePictureProcessing: false,
  changePasswordProcessing: false,
}
export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const roleService = inject(RoleService);
    const authStore = inject(AuthStore);
    return {
      isInvestor: roleService.hasAnyRoleSignal([ERoles.INVESTOR]),
      userImage: computed(() => store.userProfile()?.userPicBase64 ?? 'assets/images/user_placeholder.svg'),
      userSignature: computed(() => store.userProfile()?.signature ?? null),
      userTitle: computed(() => roleService.hasAnyRoleSignal([ERoles.INVESTOR])() ? authStore.userProfile()?.investorCode : authStore.userProfile()?.roleNames[0]),
      userID: computed(() => authStore.userProfile()?.employeeID ?? ''),
      RoleName: computed(() => authStore.userProfile()?.roleNames[0] ?? ''),
    }
  }),
  withMethods((store) => {
    const profileApiService = inject(ProfileApiService);
    const authApiService = inject(AuthApiService);

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
      },

      changePassword(request: IChangePasswordRequest): Observable<IBaseApiResponse<void>> {
        patchState(store, { changePasswordProcessing: true });
        return profileApiService.changePassword(request).pipe(
          finalize(() => {
            patchState(store, { changePasswordProcessing: false });
          })
        );
      },

      updateProfilePic(request: IUpdateProfilePicRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { profilePictureProcessing: true });
        return profileApiService.updateProfilePic(request).pipe(
          tap((res) => {
            if (res.success && res.body && store.userProfile()) {
              const photo = !request.profilePicBase64
                ? 'assets/images/user_placeholder.svg'
                : request.profilePicBase64.startsWith('data:')
                  ? request.profilePicBase64
                  : `data:image/png;base64,${request.profilePicBase64}`;
              patchState(store, {
                userProfile: { ...store.userProfile()!, photo },
              });
            }
          }),
          finalize(() => {
            patchState(store, { profilePictureProcessing: false });
          })
        );
      },
    };
  })
);