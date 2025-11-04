import { DatePipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private messageService = inject(MessageService);
  private datePipe = new DatePipe('en-us');
  success(summery: string, message?: string) {
    this.messageService.add({
      severity: 'success',
      summary: summery,
      detail: message ?? (this.datePipe.transform(new Date(), "d'th' MMMM yyyy  hh:mm a") || ''),
    });
  }
  error(summery: string, message?: string) {
    this.messageService.add({
      severity: 'error',
      summary: summery,
      detail: message ?? (this.datePipe.transform(new Date(), "d'th' MMMM yyyy  hh:mm a") || ''),
    });
  }
  warn(summery: string, message?: string) {
    this.messageService.add({
      severity: 'warn',
      summary: summery,
      detail: message ?? (this.datePipe.transform(new Date(), "d'th' MMMM yyyy  hh:mm a") || ''),
    });
  }
}
