import { AppUser } from 'app/components/auth/auth.models';

export interface GroupDetail {
  groupId: string;
  title: string;
  groupImage: string;
  userId: string;
  categoryId: string;
  isCreator: boolean;
  createdOn: string | number | Date;
  user: AppUser;
  userGroups: UserGroup[];
}

export interface UserGroup {
  userGroupId: string;
  isCreator: boolean;
  userId: string;
  groupId: string;
}
