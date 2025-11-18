import { HttpClient, type HttpResponse, HttpEventType, type HttpEvent, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../api/api-endpoints';
import { IBaseApiResponse } from '../../interfaces';

@Injectable({
	providedIn: 'root',
})
export class BaseHttpService {
	protected baseUrl: string = API_ENDPOINTS.baseUrl;
	protected http = inject(HttpClient);

	public get<R, O>(endpoint: string, options?: O): Observable<IBaseApiResponse<R>> {
		const params = new HttpParams({
			fromObject: options || {}
		  });
		
		  return this.http
			.get<IBaseApiResponse<R>>(`${this.baseUrl}/${endpoint}`, {
			  params,
			  observe: 'events'
			})
			.pipe(
			  filter(
				(event: HttpEvent<IBaseApiResponse<R>>): event is HttpResponse<IBaseApiResponse<R>> =>
				  event.type === HttpEventType.Response
			  ),
			  map((response: HttpResponse<IBaseApiResponse<R>>) => response.body as IBaseApiResponse<R>)
			);
	}

	public post<R, B, O>(endpoint: string, body: B, options?: O): Observable<IBaseApiResponse<R>> {
		return this.http
			.post<IBaseApiResponse<R>>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IBaseApiResponse<R>>): event is HttpResponse<IBaseApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IBaseApiResponse<R>>) => response.body as IBaseApiResponse<R>),
			);
	}

	public put<R, B, O>(endpoint: string, body?: B, options?: O): Observable<IBaseApiResponse<R>> {
		return this.http
			.put<IBaseApiResponse<R>>(`${this.baseUrl}/${endpoint}`, body, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IBaseApiResponse<R>>): event is HttpResponse<IBaseApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IBaseApiResponse<R>>) => response.body as IBaseApiResponse<R>),
			);
	}

	public delete<R, O>(endpoint: string, options?: O): Observable<IBaseApiResponse<R>> {
		return this.http
			.delete<IBaseApiResponse<R>>(`${this.baseUrl}/${endpoint}`, { ...options, observe: 'events' })
			.pipe(
				filter(
					(event: HttpEvent<IBaseApiResponse<R>>): event is HttpResponse<IBaseApiResponse<R>> =>
						event.type === HttpEventType.Response,
				),
				map((response: HttpResponse<IBaseApiResponse<R>>) => response.body as IBaseApiResponse<R>),
			);
	}
}
