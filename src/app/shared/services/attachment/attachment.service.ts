import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /**
   * Downloads an attachment as a Blob stream.
   * GET /api/Attachment/IBM-Download?id={id}
   */
  downloadAttachment(id: number | string): Observable<HttpResponse<Blob>> {
    const params = new HttpParams().set('id', String(id));

    return this.http.get(`${this.baseUrl}/Attachment/IMB-Download`, {
      params,
      observe: 'response',
      responseType: 'blob',
    });
  }

  /**
   * Downloads an attachment and triggers a browser download.
   * Handles filename extraction from the Content-Disposition header.
   */
  downloadAndSaveAttachment(
    id: number | string,
    fileName: string = '',
  ): Observable<void> {
    return this.downloadAttachment(id).pipe(
      map((response) => {
        const blob = response.body;
        if (!blob) {
          throw new Error('Empty download response');
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
      }),
    );
  }
}

