import { EUserStatus } from "src/app/shared/enums/users.enum";
import type { ISelectItem, TColors } from "src/app/shared/interfaces";

export class UserStatusMapper {
  mapUserStatusColor(): {
    [key in EUserStatus]: { title: string; color: TColors };
  } {
    return {
      [EUserStatus.ACTIVE]: {
        title: "Active",
        color: "green",
      },
      [EUserStatus.INACTIVE]: {
        title: "Inactive",
        color: "red",
      },
      [EUserStatus.PENDING]: {
        title: "Pending",
        color: "yellow",
      },
      [EUserStatus.BLOCKED]: {
        title: "Blocked",
        color: "red",
      },
      [EUserStatus.DELETED]: {
        title: "Deleted",
        color: "gray",
      },
    };
  }

  getMappedStatusList(): ISelectItem[] {
    return Object.entries(this.mapUserStatusColor()).map(
      ([key, value]) => ({
        name: value.title,
        id: key,
      }),
    );
  }
}
