import { TrimOnBlurDirective } from '../directives/trim-on-blur.directive';
import { ImageErrorDirective } from '../directives/image-error.directive';

/**
 * Common directives that should be imported in components using forms.
 * Import this array in your component's imports array to get common form directives.
 * 
 * Usage:
 * import { COMMON_DIRECTIVES } from 'src/app/shared/imports/common-directives';
 * 
 * @Component({
 *   imports: [..., ...COMMON_DIRECTIVES]
 * })
 */
export const COMMON_DIRECTIVES = [
  TrimOnBlurDirective,
  ImageErrorDirective,
];

