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

  private readonly TARGET_SIZE = 120;

  /**
   * Resizes an image to 120x120px. If the image is smaller than 120x120, returns it unchanged.
   * @param file - The image file to resize
   * @returns Promise resolving to the resized File or the original if smaller than 120x120
   */
  resizeImages(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const { width, height } = img;
        if (width < this.TARGET_SIZE || height < this.TARGET_SIZE) {
          resolve(file);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.TARGET_SIZE;
        canvas.height = this.TARGET_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, this.TARGET_SIZE, this.TARGET_SIZE);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Converts an image file to a base64 data URL string.
   * @param file - The file to convert
   * @returns Promise resolving to the base64 string (data URL format, e.g. "data:image/png;base64,...")
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

