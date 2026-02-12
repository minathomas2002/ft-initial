import { EMaterialsFormControls } from 'src/app/shared/enums';

/**
 * Year keys for saudization matrix and summary.
 * Single source of truth for comment field matching (inputKey + id).
 */
export const SAUDIZATION_YEAR_KEYS = [
  EMaterialsFormControls.year1,
  EMaterialsFormControls.year2,
  EMaterialsFormControls.year3,
  EMaterialsFormControls.year4,
  EMaterialsFormControls.year5,
  EMaterialsFormControls.year6,
  EMaterialsFormControls.year7,
] as const;

/** Row control names (order matches API saudizationType 1-4) */
export const SAUDIZATION_ROW_KEYS = [
  EMaterialsFormControls.annualHeadcount,
  EMaterialsFormControls.saudizationPercentage,
  EMaterialsFormControls.annualTotalCompensation,
  EMaterialsFormControls.saudiCompensationPercentage,
] as const;

export type SaudizationYearKey = (typeof SAUDIZATION_YEAR_KEYS)[number];
export type SaudizationRowKey = (typeof SAUDIZATION_ROW_KEYS)[number];
