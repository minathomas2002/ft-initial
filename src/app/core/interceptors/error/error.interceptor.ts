import { type HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToasterService } from '../../../shared/services/toaster/toaster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
	const toastr = inject(ToasterService);
	return next(req).pipe(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		tap((response: any) => {
			if (response instanceof HttpResponse && response.body?.hasError) {
				toastr.error(
					response.body.errorMessage || 'failed to process ,check your internet connection',
				);
			}
		}),
	);
};
