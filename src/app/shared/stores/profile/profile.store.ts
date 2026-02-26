import { inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { RoleService } from "../../services/role/role-service";
import { ERoles } from "../../enums";
import { ProfileApiService } from "../../api/profile/profile-api.service";
import { IProfileResponse } from "../../interfaces";
import { finalize, tap } from "rxjs";

const initialState: {
  loading: boolean;
  userProfile: IProfileResponse | null;
} = {
  loading: false,
  userProfile: null,
}
export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const roleService = inject(RoleService);
    return {
      isInvestor: roleService.hasAnyRoleSignal([ERoles.INVESTOR]),
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
    };
  })
);