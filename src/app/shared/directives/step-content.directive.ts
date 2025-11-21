import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appStepContent]',
  standalone: true,
})
export class StepContentDirective {
  private _stepNumber!: number;

  @Input() set appStepContent(value: number) {
    this._stepNumber = value;
  }

  get stepNumber(): number {
    return this._stepNumber;
  }

  constructor(public templateRef: TemplateRef<any>) {
    // TemplateRef is provided when used on ng-template
  }
}

