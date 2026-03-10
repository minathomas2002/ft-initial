import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-base-error',
	imports: [],
	templateUrl: './base-error.component.html',
	styleUrl: './base-error.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseErrorComponent {
	message = input<string>();
	styleClass = input<string>('');

	// #region agent log
	ngOnInit() {
		const msg = this.message();
		if (msg != null && typeof msg !== 'string') {
			fetch('http://127.0.0.1:7242/ingest/5b034c01-0b5b-4320-b714-d662075e070b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd8107'},body:JSON.stringify({sessionId:'bd8107',location:'base-error.component.ts:ngOnInit',message:'BaseError received non-string message',data:{messageType:typeof msg,messageValue:JSON.stringify(msg)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
		}
	}
	// #endregion
}

