import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { EUserRole } from 'src/app/shared/enums/users.enum';

@Injectable({
  providedIn: 'root',
})
export class ChangeRoleFormService {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    role: ['', [Validators.required]]
  });

  get role(): FormControl<EUserRole | null> {
    return this.form.get('role') as FormControl<EUserRole | null>;
  }
}
