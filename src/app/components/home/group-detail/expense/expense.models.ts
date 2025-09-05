export type SplitType = 'Equals' | 'Percentage' | 'Custom';

export interface SplitDetailDTO {
  userId: string;
  percentage?: number | null;
  shareAmount?: number | null;
}

export interface UpsertExpenseRequest {
  expenseId?: string | null;
  groupId: string;
  description: string;
  totalAmount: number;
  splitType: SplitType;
  paidByUserId: string;
  splitDetails: SplitDetailDTO[];
}

export interface Expense {
  expenseId?: string | null;
  groupId: string;
  description: string;
  totalAmount: number;
  splitType: SplitType;
  createdOn: string | null | Date;
  splitDetails: SplitDetailDTO[];
}
