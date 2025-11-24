import { Component, input, TemplateRef, ContentChild, computed, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-form-array-input',
  imports: [ButtonModule, NgTemplateOutlet],
  templateUrl: './form-array-input.html',
  styleUrl: './form-array-input.scss',
})
export class FormArrayInput {
  // Using any[] to accept any FieldTree array type (FieldTree is invariant in TypeScript)
  ft = model.required<FieldTree<any[], string | number>>();
  addButtonMessage = input<string>('Add');
  maxItems = input<number>(10);
  // Function to create a new empty item when adding
  createNewItem = input<() => any>(() => ({}));

  @ContentChild('itemTemplate', { read: TemplateRef }) itemTemplate?: TemplateRef<{
    $implicit: FieldTree<any, string | number>;
    index: number;
    itemValue: any;
  }>;

  // Get the array value from FieldTree
  // ft() returns the FieldTree signal, ft()() gets the actual control, then .value() gets the array
  objects = computed(() => {
    const fieldTree = this.ft();
    if (!fieldTree) return [];
    const control = fieldTree();
    return control ? control.value() : [];
  });

  keys = computed(() => {
    const objectsArray = this.objects();
    if (!objectsArray || objectsArray.length === 0) return [];

    const firstObject = objectsArray[0];
    if (!firstObject || typeof firstObject !== 'object' || firstObject === null) return [];

    return Object.keys(firstObject);
  });

  // Get FieldTree for a specific index
  getItemFieldTree(index: number): FieldTree<any, string | number> | undefined {
    const fieldTree = this.ft();
    if (!fieldTree) return undefined;
    return fieldTree[index];
  }

  onDeleteHandler(index: number) {
    const fieldTree = this.ft();
    if (!fieldTree) return;

    const control = fieldTree();
    if (!control) return;

    const currentValue = control.value();
    if (currentValue.length > 1) {
      control.setControlValue(currentValue.filter((_: any, i: number) => i !== index));
    } else {
      // Keep at least one item with empty values
      const newItem = this.createNewItem()();
      control.setControlValue([newItem]);
    }
  }

  onAddHandler() {
    const fieldTree = this.ft();
    if (!fieldTree) return;

    const control = fieldTree();
    if (!control) return;

    const currentValue = control.value();
    if (currentValue.length >= this.maxItems()) return;

    const newItem = this.createNewItem()();
    control.setControlValue([...currentValue, newItem]);
  }
}
