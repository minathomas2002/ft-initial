import { ERoles } from '../enums/roles.enum';

export interface IRole {
  id: string;
  name: string;
  code: ERoles;
  createdDate?: string;
}