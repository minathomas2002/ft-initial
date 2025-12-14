import { ERoles } from '../enums/roles.enum';

export interface IRole {
  id: string;
  name: string;
  code: ERoles;
  createdDate?: string;
}

export interface IRoleLocalized extends IRole {
  nameAr: string;
}

export interface IAssignRoleToUserRequest {
  userId: string;
  roleId: string;
}