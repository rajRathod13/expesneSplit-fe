import { AppUser } from '../auth/auth.models';
import { GroupDetail } from '../home/group-detail/group-detail.models';

export interface Invitation {
  invitationId: string;
  groupId: string;
  group: GroupDetail;
  inviterId: string;
  inviterUser: AppUser;
  invitedUserId: string;
  invitedUser: AppUser;
  createdOn: string | null | Date;
  updatedOn: string | null | Date;
}
