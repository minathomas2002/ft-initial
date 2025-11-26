import { Component, input, TemplateRef, ContentChild, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';
import { FormArray, FormGroup, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-array-input',
  imports: [ButtonModule, NgTemplateOutlet],
  templateUrl: './form-array-input.html',
  styleUrl: './form-array-input.scss',
})
export class FormArrayInput {
  // Accept FormArray instead of FieldTree
  // Using input instead of model since FormArray is mutable and changes are reflected automatically
  ft = input.required<FormArray>();
  addButtonMessage = input<string>('Add');
  maxItems = input<number>(10);
  // Function to create a new empty item when adding (returns FormGroup)
  createNewItem = input<() => FormGroup>(() => {
    throw new Error('createNewItem must be provided');
  });

  @ContentChild('itemTemplate', { read: TemplateRef }) itemTemplate?: TemplateRef<{
    $implicit: AbstractControl;
    index: number;
    itemValue: any;
  }>;

  // Get the array value from FormArray
  objects = computed(() => {
    const formArray = this.ft();
    if (!formArray) return [];
    return formArray.value || [];
  });

  keys = computed(() => {
    const objectsArray = this.objects();
    if (!objectsArray || objectsArray.length === 0) return [];

    const firstObject = objectsArray[0];
    if (!firstObject || typeof firstObject !== 'object' || firstObject === null) return [];

    return Object.keys(firstObject);
  });

  // Get FormControl/FormGroup for a specific index
  getItemControl(index: number): AbstractControl | undefined {
    const formArray = this.ft();
    if (!formArray) return undefined;
    return formArray.at(index);
  }

  onDeleteHandler(index: number) {
    const formArray = this.ft();
    if (!formArray) return;

    const currentLength = formArray.length;
    if (currentLength > 1) {
      formArray.removeAt(index);
    } else {
      // Keep at least one item with empty values
      formArray.clear();
      const newItem = this.createNewItem()();
      formArray.push(newItem);
    }
  }

  onAddHandler() {
    const formArray = this.ft();
    if (!formArray) return;

    if (formArray.length >= this.maxItems()) return;

    const newItem = this.createNewItem()();
    formArray.push(newItem);
  }
}
