import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '@env/environment';
import { GroupCategory } from 'app/components/group-category/group-category.model';

type AddGroupForm = FormGroup<{
  title: FormControl<string>;
  categoryId: FormControl<string>;
  groupImageFile: FormControl<File | null>;
}>;

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-group.component.html',
  styleUrl: './add-group.component.css',
})
export class AddGroupComponent {
  base = environment.apiBaseUrl;
  form: AddGroupForm;

  @Input({ required: true }) categories: GroupCategory[] = [];
  @Input() open = false;
  @Output() close = new EventEmitter();
  @Output() submitForm = new EventEmitter<{
    title: string;
    categoryId: string;
    groupImageFile?: File | null;
  }>();

  previewUrl: string | null = null;
  fileRef: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: this.fb.control('', {
        validators: [Validators.required, Validators.maxLength(150)],
        nonNullable: true,
      }),
      categoryId: this.fb.control('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      groupImageFile: this.fb.control<File | null>(null),
    });
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.fileRef = file ?? null;
    this.form.controls.groupImageFile.setValue(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  removeImage() {
    this.fileRef = null;
    this.previewUrl = null;
    // FIX: control name must match your form ('groupImageFile'), not 'file'
    this.form.controls.groupImageFile.setValue(null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, categoryId } = this.form.getRawValue();
    this.submitForm.emit({
      title: title!.trim(),
      categoryId: categoryId,
      groupImageFile: this.fileRef,
    });
  }

  onClose() {
    this.form = this.fb.group({
      title: this.fb.control('', {
        validators: [Validators.required, Validators.maxLength(150)],
        nonNullable: true,
      }),
      categoryId: this.fb.control('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      groupImageFile: this.fb.control<File | null>(null),
    });
    this.removeImage();
    this.close.emit(false);
  }
}
