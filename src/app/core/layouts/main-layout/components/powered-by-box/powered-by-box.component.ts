import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
	selector: 'app-powered-by-box',
	imports: [ImageModule],
	templateUrl: './powered-by-box.component.html',
	styleUrl: './powered-by-box.component.scss',
})
export class PoweredByBoxComponent {}
