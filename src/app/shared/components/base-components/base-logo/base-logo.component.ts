import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ImageErrorDirective } from '../../../directives/image-error.directive';
@Component({
	selector: 'app-base-logo',
	imports: [ImageModule, ImageErrorDirective],
	templateUrl: './base-logo.component.html',
	styleUrl: './base-logo.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLogoComponent { }
