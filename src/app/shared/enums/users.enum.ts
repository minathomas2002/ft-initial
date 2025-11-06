export enum EUserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  BLOCKED = "blocked",
  DELETED = "deleted",
}

export enum EUserRole {
  ADMIN = "admin",
  Employee = "Employee",
  MANAGER = "Manager",
  Department_Manager = "DEPT. Manger",
  DV_Manager = "DV Manager",
}

export enum EAdminUserActions {
  ChangeRole = 1,
  Delete = 2,
}
