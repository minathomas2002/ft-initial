import { HttpClient, type HttpResponse, HttpEventType, type HttpEvent, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../api/api-endpoints';
import { IApiResponse } from '../../interfaces';

@Injectable({
	providedIn: 'root',
})
export class BaseHttpService {
	protected baseUrl: string = API_ENDPOINTS.baseUrl;
	protected http = inject(HttpClient);

	public get<R, O>(endpoint: string, options?: O): Observable<IApiResponse<R>> {
		const params = new HttpParams({
			fromObject: options || {}
		  });
		
		  return this.http
			.get<IApiResponse<R>>(`${this.baseUrl}/${endpoint}`, {
			  params,
			  observe: 'events'
			})
			.pipe(
			  filter(
				(event: HttpEvent<IApiResponse<R>>): event is HttpResponse<IApiResponse<R>> =>
				  event.type === HttpEventType.Response
			  ),
			  map((response: HttpResponse<IApiResponse<R>>) => response.body as IApiResponse<R>)
			);
	}

	public post<R, B, O>(endpoint: string, body: B, options?: O): Observable<IApiResponse<R>> {
		return this.http
			.post<IApiResponse<R>>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IApiResponse<R>>): event is HttpResponse<IApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IApiResponse<R>>) => response.body as IApiResponse<R>),
			);
	}

	public put<R, B, O>(endpoint: string, body?: B, options?: O): Observable<IApiResponse<R>> {
		return this.http
			.put<IApiResponse<R>>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IApiResponse<R>>): event is HttpResponse<IApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IApiResponse<R>>) => response.body as IApiResponse<R>),
			);
	}

	public delete<R, O>(endpoint: string, options?: O): Observable<IApiResponse<R>> {
		return this.http
			.delete<IApiResponse<R>>(`${this.baseUrl}/${endpoint}`, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IApiResponse<R>>): event is HttpResponse<IApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IApiResponse<R>>) => response.body as IApiResponse<R>),
			);
	}
}
