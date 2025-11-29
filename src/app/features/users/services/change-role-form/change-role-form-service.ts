import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ERoles } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class ChangeRoleFormService {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    role: ['', [Validators.required]]
  });

  get role(): FormControl<ERoles | null> {
    return this.form.get('role') as FormControl<ERoles | null>;
  }
}
