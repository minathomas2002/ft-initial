import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private messageService = inject(MessageService);
  success(summery: string) {
    this.messageService.add({
      severity: 'success',
      summary: summery,
    });
  }
  error(summery: string) {
    this.messageService.add({
      severity: 'error',
      summary: summery,
    });
  }
  warn(summery: string) {
    this.messageService.add({
      severity: 'warn',
      summary: summery,
    });
  }
}
