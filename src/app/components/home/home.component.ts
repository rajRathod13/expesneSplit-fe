import { Component, inject, OnInit } from '@angular/core';
import { GroupService } from './group.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { GroupCategoryService } from '../group-category/group-category.service';
import { AddGroupComponent } from './group-detail/add-group/add-group.component';
import { InvitationService } from '../invitation/invitation.service';
import { GroupDetail } from './group-detail/group-detail.models';
import { GroupCategory } from '../group-category/group-category.model';
import { Invitation } from '../invitation/invitation.model';
import { ToasterService } from '../toast/toaster.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, AddGroupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isModalOpen: boolean = false;
  selectedGroupName: string = '';

  createdGroups: GroupDetail[] = [];
  groupsAsMember: GroupDetail[] = [];
  categories: GroupCategory[] = [];
  pendingInvitations: Invitation[] = [];

  openAdd = false;

  ngOnInit() {
    this.getCategories();
    this.getGroupsByUserId();
  }

  groupService = inject(GroupService);
  groupCategoryService = inject(GroupCategoryService);
  invitationService = inject(InvitationService);
  router = inject(Router);
  toaster = inject(ToasterService);

  getCategories() {
    this.groupCategoryService.getGroupCategories().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.categories = res.data;
      } else {
        this.toaster.error(res.message, 'Error', 3);
      }
    });
  }

  onCreateGroup(payload: {
    title: string;
    categoryId: string;
    groupImageFile?: File | null;
  }) {
    this.groupService.addGroupDetail(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        this.openAdd = false;
        this.getGroupsByUserId();
        this.toaster.success(res.message, 'Success', 3000);
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  getGroupsByUserId() {
    this.groupService.getGroupsByUserId().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.createdGroups = res.data.createdGroups;
        this.groupsAsMember = res.data.groupsAsMember;
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  goToGroupDetail(groupId: string, isMember: boolean) {
    this.isModalOpen = false;
    //this.selectedGroupName = groupname;
    this.router.navigate(['groupDetail', groupId], {
      state: { isMember },
    });
  }

  closeGroupModal() {
    this.isModalOpen = false;
  }
}
