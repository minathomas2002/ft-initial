import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-form-input-error-messages',
  imports: [MessageModule],
  templateUrl: './form-input-error-messages.html',
  styleUrl: './form-input-error-messages.scss',
})
export class FormInputErrorMessages {
  fieldTree = input.required<FieldTree<unknown>>();
}
