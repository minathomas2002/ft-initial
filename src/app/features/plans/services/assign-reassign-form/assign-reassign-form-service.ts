import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AssignReassignFormService {
  
  //IAssignRequest
  private fb = inject(FormBuilder);

  //declare strongly form
  readonly form  : FormGroup<{
    planId: FormControl<string | null>,
    employeeId: FormControl<string | null>
  }> = this.fb.group({
    planId: this.fb.control<string | null>( null,[Validators.required]),
    employeeId: this.fb.control<string | null> (null, [Validators.required])
  });

  get planId(){return this.form.controls.planId}
  get employeeId() { return this.form.controls.employeeId};
  

  resetForm(){
    this.form.reset();
  }
}
