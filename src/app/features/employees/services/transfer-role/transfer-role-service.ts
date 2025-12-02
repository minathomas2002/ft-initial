import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class TransferRoleService {
  #FB = inject(FormBuilder);
  form = this.#FB.group({
    employee: ['', [Validators.required]],
  });

  get employee(): FormControl {
    return this.form.get('employee') as FormControl;
  }

  resetForm() {
    this.form.reset();
  }
}
