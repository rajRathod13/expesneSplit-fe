import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GroupDetail } from '../group-detail.models';

@Component({
  selector: 'app-group-detail-header',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './group-detail-header.component.html',
  styleUrl: './group-detail-header.component.css',
})
export class GroupDetailHeaderComponent {
  @Input({ required: true }) groupDetail!: GroupDetail;
}
