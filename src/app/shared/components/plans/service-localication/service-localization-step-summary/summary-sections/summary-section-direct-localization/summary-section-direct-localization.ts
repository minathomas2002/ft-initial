import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-summary-section-direct-localization',
  imports: [SummarySectionHeader, SummaryTableCell, TableModule, TooltipModule],
  templateUrl: './summary-section-direct-localization.html',
  styleUrl: './summary-section-direct-localization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionDirectLocalization {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  onEdit = output<void>();

  EMaterialsFormControls = EMaterialsFormControls;
  // Year columns for Entity Level and Service Level (6 years)
  serviceForm = inject(ServicePlanFormService);
  planStore = inject(PlanStore);
  yearColumns = computed(() => this.serviceForm.upcomingYears(6));

  constructor() {
    // Ensure service names are synced even if the user never visited the step component
    this.serviceForm.syncServicesFromCoverPageToDirectLocalization();
  }

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
    EMaterialsFormControls.sixthYear,
  ];

  // Form group accessors
  directLocalizationServiceLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  });

  entityLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.entityLevelFormGroup) as FormArray;
  });

  serviceLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  });

  // Helper method to get values
  getValue(controlPath: string): any {
    const parts = controlPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control = control.get(part);
      } else {
        return null;
      }
    }

    if (control && 'value' in control) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }

    return control?.value ?? null;
  }

  hasFieldError(fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control = control.get(part);
      } else {
        return false;
      }
    }

    if (control && control.invalid && (control.dirty || control.touched)) {
      return true;
    }

    return false;
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  private mapOptionName(options: { id: string; name: string }[], rawValue: unknown): string | null {
    if (rawValue === null || rawValue === undefined || rawValue === '') return null;
    const raw = String(rawValue);
    const match = options.find((o) => String(o.id) === raw);
    return match ? match.name : raw;
  }

  formatLocalizationApproach(value: unknown): string | null {
    return this.mapOptionName(this.planStore.localizationApproachOptions(), value);
  }

  formatLocation(value: unknown): string | null {
    return this.mapOptionName(this.planStore.locationOptions(), value);
  }

  formatYesNo(value: unknown): string | null {
    // API values can come as boolean; form values usually come as yes/no ids.
    if (value === true || value === 'true') return 'Yes';
    if (value === false || value === 'false') return 'No';
    return this.mapOptionName(this.planStore.yesNoOptions(), value);
  }

  // Localization Strategy array (same as service level)
  localizationStrategy = computed(() => {
    const strategyArray = this.directLocalizationServiceLevelFormArray();
    if (!strategyArray) return [];

    return Array.from({ length: strategyArray.length }, (_, i) => {
      const group = strategyArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        index: i,
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        expectedLocalizationDate: getValueFromControl(EMaterialsFormControls.expectedLocalizationDate),
        localizationApproach: this.formatLocalizationApproach(
          getValueFromControl(EMaterialsFormControls.localizationApproach)
        ),
        localizationApproachOther: getValueFromControl(EMaterialsFormControls.localizationApproachOtherDetails),
        location: this.formatLocation(getValueFromControl(EMaterialsFormControls.location)),
        locationOther: getValueFromControl(EMaterialsFormControls.locationOtherDetails),
        capexRequired: getValueFromControl(EMaterialsFormControls.capexRequired),
        supervisionOversight: getValueFromControl(EMaterialsFormControls.supervisionOversightByGovernmentEntity),
        proprietaryTools: this.formatYesNo(
          getValueFromControl(EMaterialsFormControls.willBeAnyProprietaryToolsSystems)
        ),
        proprietaryToolsExplanation: getValueFromControl(EMaterialsFormControls.proprietaryToolsSystemsDetails),
      };
    });
  });

  hasLocalizationStrategyFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`localizationStrategyFormGroup.${index}.${controlName}.value`);
  }

  // Entity Level data
  entityLevel = computed(() => {
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return null;

    const group = entityArray.at(0) as FormGroup;
    const getValueFromControl = (controlName: string) => {
      const ctrl = group.get(controlName);
      if (ctrl instanceof FormGroup) {
        return ctrl.get(EMaterialsFormControls.value)?.value;
      }
      return ctrl?.value;
    };

    return {
      headcount: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_headcount`), controlName: `${key}_headcount` })),
      saudization: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_saudization`), controlName: `${key}_saudization` })),
    };
  });

  hasEntityFieldError(controlName: string): boolean {
    // entity array only has one item at index 0
    return this.hasFieldError(`entityLevelFormGroup.0.${controlName}.value`);
  }

  // Service Level data
  serviceLevel = computed(() => {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray) return [];

    return Array.from({ length: serviceArray.length }, (_, i) => {
      const group = serviceArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        index: i,
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        expectedLocalizationDate: getValueFromControl(EMaterialsFormControls.expectedLocalizationDate),
        headcountYears: this.yearControlKeys.map((key) => ({
          value: getValueFromControl(`${key}_headcount`),
          controlName: `${key}_headcount`,
        })),
        years: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_saudization`), controlName: `${key}_saudization` })),
        keyMeasuresToUpskillSaudis: getValueFromControl(EMaterialsFormControls.keyMeasuresToUpskillSaudis),
        mentionSupportRequiredFromSEC: getValueFromControl(EMaterialsFormControls.mentionSupportRequiredFromSEC),
      };
    });
  });

  hasServiceLevelFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`serviceLevelFormGroup.${index}.${controlName}.value`);
  }

  // Check if a field has a comment
  hasFieldComment(fieldKey: string, section?: string, rowId?: string): boolean {
    // Helper function to check if inputKey matches the fieldKey
    // Handles cases where inputKey might have an index suffix (e.g., 'fieldName_0', 'fieldName_1')
    const matchesInputKey = (inputKey: string): boolean => {
      // Exact match
      if (inputKey === fieldKey) return true;
      // Match with section prefix
      if (section && inputKey === `${section}.${fieldKey}`) return true;
      // Match with index suffix (for table rows): 'fieldKey_0', 'fieldKey_1', etc.
      if (inputKey.startsWith(fieldKey + '_') && /^\d+$/.test(inputKey.substring(fieldKey.length + 1))) return true;
      // Match with section prefix and index suffix: 'section.fieldKey_0', 'section.fieldKey_1', etc.
      if (section && inputKey.startsWith(`${section}.${fieldKey}_`) && /^\d+$/.test(inputKey.substring(`${section}.${fieldKey}`.length + 1))) return true;
      return false;
    };

    // For investor view mode, check if any field with this inputKey has an ID in correctedFieldIds
    if (this.correctedFieldIds().length > 0) {
      const hasCorrectedField = this.pageComments().some(comment =>
        comment.fields?.some(field =>
          matchesInputKey(field.inputKey) &&
          (!section || field.section === section) &&
          field.id &&
          this.correctedFieldIds().includes(field.id) &&
          (rowId === undefined || field.id === rowId)
        )
      );
      if (hasCorrectedField) {
        return true;
      }
    }

    // Check if field has comments
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        matchesInputKey(field.inputKey) &&
        (!section || field.section === section) &&
        (rowId === undefined || field.id === rowId)
      )
    );
  }

  // Check if a field is resolved/corrected by investor (based on correctedFieldIds)
  isFieldResolved(fieldKey: string, section?: string, rowId?: string): boolean {
    if (this.correctedFieldIds().length === 0) return false;

    const matchesInputKey = (inputKey: string): boolean => {
      if (inputKey === fieldKey) return true;
      if (section && inputKey === `${section}.${fieldKey}`) return true;
      if (inputKey.startsWith(fieldKey + '_') && /^\d+$/.test(inputKey.substring(fieldKey.length + 1))) return true;
      if (
        section &&
        inputKey.startsWith(`${section}.${fieldKey}_`) &&
        /^\d+$/.test(inputKey.substring(`${section}.${fieldKey}`.length + 1))
      )
        return true;
      return false;
    };

    return this.pageComments().some((comment) =>
      comment.fields?.some(
        (field) =>
          matchesInputKey(field.inputKey) &&
          (!section || field.section === section) &&
          !!field.id &&
          this.correctedFieldIds().includes(field.id) &&
          (rowId === undefined || field.id === rowId)
      )
    );
  }

  // Helper methods for checking comments on array items
  hasLocalizationStrategyComment(index: number, fieldKey: string): boolean {
    const strategyArray = this.directLocalizationServiceLevelFormArray();
    if (!strategyArray || index >= strategyArray.length) return false;
    const strategyGroup = strategyArray.at(index) as FormGroup;
    const rowId = strategyGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'localizationStrategy', rowId);
  }

  hasEntityLevelComment(fieldKey: string): boolean {
    // Entity level array only has one item at index 0
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return false;
    const entityGroup = entityArray.at(0) as FormGroup;
    const rowId = entityGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'entityLevel', rowId);
  }

  isEntityLevelResolved(fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'entityLevel');
  }

  hasServiceLevelComment(index: number, fieldKey: string): boolean {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray || index >= serviceArray.length) return false;
    const serviceGroup = serviceArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'serviceLevel', rowId);
  }

  isServiceLevelResolved(index: number, fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'serviceLevel', index);
  }

  // Helper methods for checking comments on "Other" detail fields
  hasLocalizationApproachOtherComment(index: number): boolean {
    return this.hasLocalizationStrategyComment(index, 'localizationApproachOtherDetails');
  }

  hasLocationOtherComment(index: number): boolean {
    return this.hasLocalizationStrategyComment(index, 'locationOtherDetails');
  }

  hasProprietaryToolsExplanationComment(index: number): boolean {
    return this.hasLocalizationStrategyComment(index, 'proprietaryToolsSystemsDetails');
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string, section: 'localizationStrategy' | 'entityLevel' | 'serviceLevel', index?: number): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.servicePlan) return null;

    const plan = originalPlan.servicePlan;

    switch (section) {
      case 'localizationStrategy':
        if (index !== undefined && plan.localizationStrategies && plan.services) {
          // Get the service ID from the form at this index
          const formArray = this.directLocalizationServiceLevelFormArray();
          if (!formArray || index >= formArray.length) return null;
          const formGroup = formArray.at(index) as FormGroup;
          const serviceId = formGroup.get(EMaterialsFormControls.serviceId)?.value;
          if (!serviceId) return null;

          // Find the matching localization strategy by planServiceTypeId
          const strategy = plan.localizationStrategies.find((s: any) => s.planServiceTypeId === serviceId);
          if (!strategy) return null;

          // Find service name from services array
          const service = plan.services.find((s: any) => s.id === serviceId);
          const serviceName = service?.serviceName ?? null;

          switch (fieldKey) {
            case 'serviceName':
              return serviceName;
            case 'expectedLocalizationDate':
              return strategy.expectedLocalizationDate ?? null;
            case 'localizationApproach':
              return this.formatLocalizationApproach(strategy.localizationApproach ?? null);
            case 'localizationApproachOtherDetails':
              return strategy.otherLocalizationApproach ?? null;
            case 'location':
              return this.formatLocation(strategy.locationType ?? null);
            case 'locationOtherDetails':
              return strategy.otherLocationType ?? null;
            case 'capexRequired':
              return strategy.capexRequired ?? null;
            case 'supervisionOversightByGovernmentEntity':
              return strategy.governmentSupervision ?? null;
            case 'willBeAnyProprietaryToolsSystems':
              return this.formatYesNo(strategy.hasProprietaryTools ?? null);
            case 'proprietaryToolsSystemsDetails':
              return strategy.proprietaryToolsDetails ?? null;
          }
        }
        return null;

      case 'entityLevel':
        if (plan.entityHeadcounts && plan.entityHeadcounts.length > 0) {
          // Filter for Direct Localization (pageNumber: 4)
          const entity = plan.entityHeadcounts.find((e: any) => e.pageNumber === 4);
          if (!entity) return null;
          const yearMap: Record<string, string> = {
            'firstYear_headcount': 'y1Headcount',
            'secondYear_headcount': 'y2Headcount',
            'thirdYear_headcount': 'y3Headcount',
            'fourthYear_headcount': 'y4Headcount',
            'fifthYear_headcount': 'y5Headcount',
            'sixthYear_headcount': 'y6Headcount',
            'firstYear_saudization': 'y1Saudization',
            'secondYear_saudization': 'y2Saudization',
            'thirdYear_saudization': 'y3Saudization',
            'fourthYear_saudization': 'y4Saudization',
            'fifthYear_saudization': 'y5Saudization',
            'sixthYear_saudization': 'y6Saudization',
          };
          const yearKey = yearMap[fieldKey];
          if (yearKey && entity[yearKey as keyof typeof entity] !== undefined) {
            return entity[yearKey as keyof typeof entity] ?? null;
          }
        }
        return null;

      case 'serviceLevel':
        if (index !== undefined && plan.serviceHeadcounts && plan.serviceHeadcounts.length > 0) {
          // Filter for Direct Localization (pageNumber: 4)
          const servicesForDirectLocalization = plan.serviceHeadcounts.filter((s: any) => s.pageNumber === 4);
          if (index >= servicesForDirectLocalization.length) return null;
          const service = servicesForDirectLocalization[index];
          const yearMap: Record<string, string> = {
            'firstYear_headcount': 'y1Headcount',
            'secondYear_headcount': 'y2Headcount',
            'thirdYear_headcount': 'y3Headcount',
            'fourthYear_headcount': 'y4Headcount',
            'fifthYear_headcount': 'y5Headcount',
            'sixthYear_headcount': 'y6Headcount',
            'firstYear_saudization': 'y1Saudization',
            'secondYear_saudization': 'y2Saudization',
            'thirdYear_saudization': 'y3Saudization',
            'fourthYear_saudization': 'y4Saudization',
            'fifthYear_saudization': 'y5Saudization',
            'sixthYear_saudization': 'y6Saudization',
          };
          if (fieldKey === 'serviceName') {
            // Find service name from services array by matching planServiceTypeId
            if (plan.services && service.planServiceTypeId) {
              const matchingService = plan.services.find((s: any) => s.id === service.planServiceTypeId);
              return matchingService?.serviceName ?? null;
            }
          } else if (fieldKey === 'expectedLocalizationDate') {
            return service.localizationDate ?? null;
          } else if (fieldKey === 'keyMeasuresToUpskillSaudis') {
            return service.measuresUpSkillSaudis ?? null;
          } else if (fieldKey === 'mentionSupportRequiredFromSEC') {
            return service.mentionSupportRequiredSEC ?? null;
          } else {
            const yearKey = yearMap[fieldKey];
            if (yearKey && service[yearKey as keyof typeof service] !== undefined) {
              return service[yearKey as keyof typeof service] ?? null;
            }
          }
        }
        return null;

      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string, section: 'localizationStrategy' | 'entityLevel' | 'serviceLevel', index?: number): any {
    switch (section) {
      case 'localizationStrategy':
        if (index !== undefined) {
          const strategies = this.localizationStrategy();
          if (strategies[index]) {
            const strategy = strategies[index];
            switch (fieldKey) {
              case 'serviceName':
                return strategy.serviceName ?? null;
              case 'expectedLocalizationDate':
                return strategy.expectedLocalizationDate ?? null;
              case 'localizationApproach':
                return strategy.localizationApproach ?? null;
              case 'localizationApproachOtherDetails':
                return strategy.localizationApproachOther ?? null;
              case 'location':
                return strategy.location ?? null;
              case 'locationOtherDetails':
                return strategy.locationOther ?? null;
              case 'capexRequired':
                return strategy.capexRequired ?? null;
              case 'supervisionOversightByGovernmentEntity':
                return strategy.supervisionOversight ?? null;
              case 'willBeAnyProprietaryToolsSystems':
                return strategy.proprietaryTools ?? null;
              case 'proprietaryToolsSystemsDetails':
                return strategy.proprietaryToolsExplanation ?? null;
            }
          }
        }
        return null;

      case 'entityLevel':
        const entity = this.entityLevel();
        if (entity) {
          const headcount = entity.headcount.find(h => h.controlName === fieldKey);
          if (headcount) return headcount.value ?? null;
          const saudization = entity.saudization.find(s => s.controlName === fieldKey);
          return saudization?.value ?? null;
        }
        return null;

      case 'serviceLevel':
        if (index !== undefined) {
          const services = this.serviceLevel();
          if (services[index]) {
            if (fieldKey === 'serviceName' || fieldKey === 'expectedLocalizationDate' ||
              fieldKey === 'keyMeasuresToUpskillSaudis' || fieldKey === 'mentionSupportRequiredFromSEC') {
              return services[index][fieldKey as keyof typeof services[0]] ?? null;
            } else {
              const headcount = services[index].headcountYears.find(h => h.controlName === fieldKey);
              if (headcount) return headcount.value ?? null;
              const year = services[index].years.find(y => y.controlName === fieldKey);
              return year?.value ?? null;
            }
          }
        }
        return null;

      default:
        return null;
    }
  }

  // Helper method to check if field should show diff (has before and after values and they differ)
  shouldShowDiff(fieldKey: string, section: 'localizationStrategy' | 'entityLevel' | 'serviceLevel', index?: number): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // For array items, validate index
    if (index !== undefined) {
      if (section === 'localizationStrategy') {
        const strategyArray = this.directLocalizationServiceLevelFormArray();
        if (!strategyArray || index >= strategyArray.length) return false;
      } else if (section === 'serviceLevel') {
        const serviceArray = this.serviceLevelFormArray();
        if (!serviceArray || index >= serviceArray.length) return false;
      }
    } else if (section === 'entityLevel') {
      const entityArray = this.entityLevelFormArray();
      if (!entityArray || entityArray.length === 0) return false;
    }

    const beforeValue = this.getBeforeValue(fieldKey, section, index);
    const afterValue = this.getAfterValue(fieldKey, section, index);

    // Compare values
    if (beforeValue === afterValue) return false;
    if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
      return afterValue !== null && afterValue !== undefined && afterValue !== '';
    }
    if (afterValue === null || afterValue === undefined || afterValue === '') {
      return true;
    }

    // For arrays, compare by JSON stringify
    if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
      return JSON.stringify(beforeValue.sort()) !== JSON.stringify(afterValue.sort());
    }

    // For objects, compare by JSON stringify
    if (typeof beforeValue === 'object' && typeof afterValue === 'object' && beforeValue !== null && afterValue !== null) {
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    }

    return String(beforeValue) !== String(afterValue);
  }
}
