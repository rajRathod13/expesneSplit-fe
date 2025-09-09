import { Component, inject, OnInit, SimpleChanges } from '@angular/core';
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
import {
  Expense,
  SplitType,
  UpsertExpenseRequest,
} from './expense/expense.models';
import { ExpenseService } from './expense/expense.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    GroupMembersComponent,
    GroupDetailHeaderComponent,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.css',
})
export class GroupDetailComponent implements OnInit {
  base = environment.apiBaseUrl;
  groupId: string | undefined = '';
  isMember: boolean = false;
  openInvite: boolean = false;
  openAddExpense = false;
  createdOnText = '';
  groupDetail!: GroupDetail;
  groupMembers: AppUser[] = [];
  unInvitedUsers: AppUser[] = [];
  groupExpenses: Expense[] = [];

  private fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  subscriptionService = inject(SubscriptionService);
  groupService = inject(GroupService);
  invitationService = inject(InvitationService);
  toasterService = inject(ToasterService);
  expenseService = inject(ExpenseService);
  router = inject(Router);

  form!: FormGroup;

  ngOnInit() {
    const navState = history.state;
    this.isMember = navState?.isMember;
    this.groupId = this.route.snapshot.paramMap.get('groupId') ?? undefined;
    this.getGroupDetailById(this.groupId);
    this.getusersByGroupId(this.groupId);
    this.getExpensesByGroupId(this.groupId, true);
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

  getExpensesByGroupId(groupId?: string, latestOnly?: boolean) {
    this.expenseService
      .getExpensesByGroupId(groupId, latestOnly)
      .subscribe((res: any) => {
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
          console.log(res.data);
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

  //Expense
  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupMembers'] && this.form) {
      this.resetMembersArray(); // rebuild rows if members input changes

      // If current paidByUserId is no longer in the list, set a safe default
      const paidCtrl = this.form.get('paidByUserId');
      const current = paidCtrl?.value;
      const exists = (this.groupMembers ?? []).some((m) => m.id === current);
      if (!exists) {
        const fallback =
          this.groupMembers?.[0]?.id ?? this.groupDetail?.user?.id ?? null;
        paidCtrl?.setValue(fallback, { emitEvent: false });
      }
    }
  }

  openModel() {
    this.openAddExpense = true;
    this.buildForm();
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const { description, totalAmount, splitType, paidByUserId } = this.form
      .value as {
      description: string;
      totalAmount: number;
      splitType: SplitType;
      paidByUserId: string;
    };

    const details: any[] = [];
    const tol = 0.01;

    if (splitType === 'Equals') {
      const included = this.members.controls
        .filter((g) => g.value.include)
        .map((g) => ({
          userId: g.value.userId,
          percentage: null,
          shareAmount: null,
        }));

      if (included.length === 0) {
        this.form.get('members')?.setErrors({ noMember: true });
        return;
      }
      details.push(...included);
    }

    if (splitType === 'Percentage') {
      let sum = 0;
      for (const g of this.members.controls) {
        const p = Number(g.value.percentage);
        if (!isNaN(p) && p > 0) {
          sum += p;
          details.push({
            userId: g.value.userId,
            percentage: p,
            shareAmount: null,
          });
        }
      }
      if (Math.abs(sum - 100) > tol) {
        this.form.get('members')?.setErrors({ percentSum: true });
        return;
      }
    }

    if (splitType === 'Custom') {
      let sum = 0;
      for (const g of this.members.controls) {
        const s = Number(g.value.shareAmount);
        if (!isNaN(s) && s > 0) {
          sum += s;
          details.push({
            userId: g.value.userId,
            percentage: null,
            shareAmount: s,
          });
        }
      }
      if (Math.abs(sum - Number(totalAmount)) > tol) {
        this.form.get('members')?.setErrors({ shareSum: true });
        return;
      }
    }

    const body: UpsertExpenseRequest = {
      expenseId: null,
      groupId: this.groupDetail.groupId,
      description: description?.trim(),
      totalAmount: Number(totalAmount),
      splitType,
      splitDetails: details,
      paidById: paidByUserId,
    };

    // this.expenseSvc.upsertExpense(body).subscribe({
    //   next: _ => {
    //     this.openAddExpense = false;
    //     this.form.reset({ description: '', totalAmount: null, splitType: 'Equals' });
    //     this.resetMembersArray();
    //   },
    //   error: err => {
    //     console.error('Add expense failed', err);
    //     // optionally surface a toast/error flag
    //   }
    // });
    this.expenseService.upsertExpense(body).subscribe((res: any) => {
      if (res.isSuccess) {
        this.openAddExpense = false;
        this.form.reset({
          description: '',
          totalAmount: null,
          splitType: 'Equals',
        });
        this.resetMembersArray();
        this.toasterService.success(res.message, 'Success', 3000);
        this.getExpensesByGroupId(this.groupId, true);
      } else {
        this.toasterService.error(res.message, 'Success', 3000);
      }
    });
  }

  private buildForm() {
    const defaultPayerId =
      this.groupMembers?.[0]?.id ?? this.groupDetail?.user?.id ?? null;

    this.form = this.fb.group({
      description: ['', Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(0.01)]],
      splitType: ['Equals' as SplitType, Validators.required],
      paidByUserId: [defaultPayerId, Validators.required],
      members: this.fb.array([]),
    });
    this.resetMembersArray();

    // clear irrelevant fields when switching split
    this.form.get('splitType')!.valueChanges.subscribe((t: SplitType) => {
      const arr = this.members;
      for (let i = 0; i < arr.length; i++) {
        const g = arr.at(i) as FormGroup;
        if (t === 'Equals') {
          g.patchValue(
            { percentage: null, shareAmount: null },
            { emitEvent: false }
          );
        } else if (t === 'Percentage') {
          g.patchValue({ shareAmount: null }, { emitEvent: false });
        } else {
          g.patchValue({ percentage: null }, { emitEvent: false });
        }
      }
    });
  }

  private resetMembersArray() {
    const arr = this.fb.array(
      (this.groupMembers ?? []).map((m) =>
        this.fb.group({
          userId: [m.id, Validators.required],
          include: [true], // used by Equals
          percentage: [null], // used by Percentage
          shareAmount: [null], // used by Custom
        })
      )
    );
    this.form.setControl('members', arr);
  }

  get members(): FormArray {
    return this.form.get('members') as FormArray;
  }

  trackByUserId = (_: number, m: any) => m.userId;
}
