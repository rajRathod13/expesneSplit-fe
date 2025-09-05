import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { GroupDetail } from '../group-detail.models';
import { AppUser } from 'app/components/auth/auth.models';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '../expense/expense.service';
import { SplitType, UpsertExpenseRequest } from '../expense/expense.models';
import { ToasterService } from 'app/components/toast/toaster.service';

@Component({
  selector: 'app-group-detail-header',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './group-detail-header.component.html',
  styleUrl: './group-detail-header.component.css',
})
export class GroupDetailHeaderComponent {
  @Input({ required: true }) groupDetail!: GroupDetail;
  @Input({ required: true }) groupMembers: AppUser[] = [];
  openAddExpense = false;

  private fb = inject(FormBuilder);
  private expenseSvc = inject(ExpenseService);
  private toasterService = inject(ToasterService);

  form!: FormGroup;

  ngOnInit() {
    this.buildForm();
  }

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
      paidByUserId: paidByUserId,
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
    this.expenseSvc.upsertExpense(body).subscribe((res: any) => {
      if (res.isSuccess) {
        this.openAddExpense = false;
        this.form.reset({
          description: '',
          totalAmount: null,
          splitType: 'Equals',
        });
        this.resetMembersArray();
        this.toasterService.success(res.message, 'Success', 3000);
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
}
