import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';
@Component({
	selector: 'app-base-logo',
	imports: [ImageModule],
	templateUrl: './base-logo.component.html',
	styleUrl: './base-logo.component.scss',
})
export class BaseLogoComponent { }
