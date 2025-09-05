import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../group.service';
import { environment } from '@env/environment';
import { CommonModule, DatePipe } from '@angular/common';
import { GroupMembersComponent } from './group-members/group-members.component';
import { AppUser } from 'app/components/auth/auth.models';
import { GroupDetailHeaderComponent } from './group-detail-header/group-detail-header.component';
import { SubscriptionService } from '../subscription.service';
import { InvitationService } from '../../invitation/invitation.service';
import { GroupDetail } from './group-detail.models';
import { ToasterService } from 'app/components/toast/toaster.service';
import { Expense } from './expense/expense.models';
import { ExpenseService } from './expense/expense.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    GroupMembersComponent,
    GroupDetailHeaderComponent,
    DatePipe,
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.css',
})
export class GroupDetailComponent implements OnInit {
  base = environment.apiBaseUrl;
  groupId: string | undefined = '';
  isMember: boolean = false;
  openInvite: boolean = false;
  createdOnText = '';
  groupDetail!: GroupDetail;
  groupMembers: AppUser[] = [];
  unInvitedUsers: AppUser[] = [];
  groupExpenses: Expense[] = [];

  route = inject(ActivatedRoute);
  subscriptionService = inject(SubscriptionService);
  groupService = inject(GroupService);
  invitationService = inject(InvitationService);
  toasterService = inject(ToasterService);
  expenseService = inject(ExpenseService);
  router = inject(Router);

  ngOnInit() {
    const navState = history.state;
    this.isMember = navState?.isMember;
    this.groupId = this.route.snapshot.paramMap.get('groupId') ?? undefined;
    this.getGroupDetailById(this.groupId);
    this.getusersByGroupId(this.groupId);
    this.getExpensesByGroupId(this.groupId);
  }

  getGroupDetailById(id?: string) {
    if (!id) return;
    this.groupService.getGroupDetailById(id).subscribe((res: any) => {
      if (res?.isSuccess && res?.data) {
        const data = res.data;
        this.groupDetail = data;
        // this.groupDetail = {
        //   groupId: data.groupId ?? '',
        //   title: data.title ?? '',
        //   userId: data.userId ?? '',
        //   groupImage: data.groupImage ? `${this.base}/${data.groupImage}` : '',
        //   categoryId: data.categoryId ?? '',
        //   isCreator: !!data.isCreator,
        //   createdOn: data.createdOn ?? Date.now(),
        //   user: {
        //     fullName: data?.user?.fullName ?? '',
        //     userId: data?.user?.userId ?? '',
        //   },
        //   members: Array.isArray(data?.useGroups) ? data.useGroups.length : 0,
        // };
      } else {
        this.toasterService.error(res.message);
      }
    });
  }

  getExpensesByGroupId(groupId?: string) {
    this.expenseService.getExpensesByGroupId(groupId).subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.groupExpenses = res.data;
        console.log(this.groupExpenses);
      }
    });
  }

  getusersByGroupId(groupId?: string) {
    if (!groupId) return;
    this.groupService.getUsersByGroupId(groupId).subscribe((res: any) => {
      if (res?.isSuccess && res?.data) {
        this.groupMembers = res?.data;
      }
    });
  }

  getUnInvitedUsers(groupId: string) {
    this.openInvite = true;
    this.subscriptionService
      .getUnInvitedUsers(groupId)
      .subscribe((res: any) => {
        if (res.isSuccess && res.data) {
          this.unInvitedUsers = res?.data;
        }
      });
  }

  sendInvitation(payload: { groupId: string; invitedUserId: string }) {
    this.invitationService.sendInvitation(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        this.toasterService.success(res.message);
        this.openInvite = false;
      } else {
        this.toasterService.error(res.message);
      }
    });
  }

  removeUserFromGroup(payload: { userId: string; groupId: string }) {
    this.subscriptionService
      .removeMemberFromGroup(payload)
      .subscribe((res: any) => {
        if (res.isSuccess) {
          this.toasterService.success(res.message);
          // this.getusersByGroupId(this.groupId);
          this.groupMembers = this.groupMembers.filter(
            (member) => member.id != payload.userId
          );
        } else {
          this.toasterService.error(res.message);
        }
      });
  }

  navigateTo(expense: any) {
    this.router.navigate(['/expenseDetail', expense.expenseId]);
  }

  trackByUserId = (_: number, m: any) => m.userId;
}
