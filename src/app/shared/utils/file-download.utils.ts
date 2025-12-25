import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

/**
 * Extracts filename from Content-Disposition header
 * Supports both RFC 5987 format (filename*) and standard format (filename)
 * 
 * @param headers - HTTP response headers
 * @param defaultFilename - Default filename to use if header is not available (default: 'file.pdf')
 * @returns Extracted filename or default filename
 * 
 * @example
 * const filename = extractFilenameFromHeaders(response.headers, 'plan.pdf');
 */
export function extractFilenameFromHeaders(headers: HttpHeaders, defaultFilename: string = 'file.pdf'): string {
  const contentDisposition = headers.get('Content-Disposition');
  
  if (!contentDisposition) {
    return defaultFilename;
  }

  // Priority 1: Try to match filename*=charset''encoded_filename (RFC 5987)
  // Example: filename*=UTF-8''Plan-6-kk-25%2F12%2F2025.pdf
  const filenameStarMatch = contentDisposition.match(/filename\*=([^;]+)/i);
  if (filenameStarMatch && filenameStarMatch[1]) {
    const value = filenameStarMatch[1];
    // Split by single quote to get encoding and filename
    const parts = value.split("'");
    if (parts.length >= 3) {
      // parts[0] = charset (e.g., UTF-8), parts[2] = encoded filename
      try {
        return decodeURIComponent(parts[2]);
      } catch {
        // If decoding fails, use as-is
        return parts[2];
      }
    }
  }

  // Priority 2: Try to match filename="value" or filename=value (standard format)
  // Example: filename="Plan-6-kk-25/12/2025.pdf"
  const filenameMatch = contentDisposition.match(/filename[^;]*=([^;]+)/i);
  if (filenameMatch && filenameMatch[1]) {
    let filename = filenameMatch[1].trim();
    // Remove quotes if present
    filename = filename.replace(/^["']|["']$/g, '');
    // URL decode if needed (handles cases where filename is URL encoded)
    try {
      return decodeURIComponent(filename);
    } catch {
      // If decoding fails, use as-is
      return filename;
    }
  }

  return defaultFilename;
}

/**
 * Triggers a file download from a blob
 * Creates a temporary anchor element, triggers the download, and cleans up resources
 * 
 * @param blob - The blob to download
 * @param filename - The filename for the downloaded file
 * 
 * @example
 * downloadFileFromBlob(blob, 'document.pdf');
 */
export function downloadFileFromBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the blob URL after a delay to allow the download to start
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}

/**
 * RxJS operator to handle blob error responses
 * Parses JSON error messages from blob error responses
 * 
 * @param defaultErrorMessage - Default error message if parsing fails
 * @returns RxJS operator function
 * 
 * @example
 * .pipe(
 *   catchError(handleBlobError('Error downloading file'))
 * )
 */
export function handleBlobError(defaultErrorMessage: string = 'Error processing file'): (error: HttpErrorResponse) => Observable<never> {
  return (error: HttpErrorResponse): Observable<never> => {
    // If error response is a blob (which might contain JSON error), try to parse it
    if (error.error instanceof Blob) {
      const reader = new FileReader();
      const blobPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          try {
            resolve(reader.result as string);
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read error blob'));
        reader.readAsText(error.error);
      });

      return from(blobPromise).pipe(
        switchMap((text) => {
          try {
            const errorObj = JSON.parse(text);
            const errorMessage = errorObj.message || errorObj.errors?.[0] || defaultErrorMessage;
            return throwError(() => new Error(errorMessage));
          } catch {
            return throwError(() => new Error(defaultErrorMessage));
          }
        })
      );
    }
    
    return throwError(() => error);
  };
}

