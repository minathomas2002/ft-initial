import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal, viewChild } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import {
  type FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";
import { AttachmentService } from "src/app/shared/services/attachment/attachment.service";
import { ImageErrorDirective } from "../../../directives/image-error.directive";
import { TranslatePipe } from "../../../pipes";
import { Attachment } from "src/app/shared/interfaces/plans.interface";

@Component({
  selector: "app-fileupload",
  imports: [FileUploadModule, ButtonModule, ToastModule, ImageErrorDirective, TranslatePipe],
  templateUrl: "./fileupload.component.html",
  styleUrl: "./fileupload.component.scss",
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileuploadComponent {
  isViewMode = input<boolean>(false);
  disabled = input<boolean>(false);
  showDownloadButton = input<boolean>(false);
  maxFileSize = input<number>(1024 * 1024 * 10); // 10MB default
  acceptedFileTypes = input<string>("*/*");
  files = model<File[]>([]);
  placeholder = input("SVG, PNG, JPG, PDF, DOCX, MP4");
  multiple = input<boolean>(false);
  styleClass = input<string>("");

  /**
   * Highlight classes set by appConditionalColorClass when used on app-fileupload.
   * Merged with styleClass and passed to p-fileupload.
   */
  conditionalHighlightClasses = signal<string>("");

  /** Effective styleClass: styleClass + conditional highlight classes from directive */
  effectiveStyleClass = computed(() => {
    const base = this.styleClass().trim();
    const highlight = this.conditionalHighlightClasses().trim();
    return [base, highlight].filter(Boolean).join(" ");
  });

  /** Called by ConditionalColorClassDirective when on app-fileupload. */
  setConditionalHighlightClasses(classes: string): void {
    this.conditionalHighlightClasses.set(classes);
  }

  // Computed property to determine if file upload should be disabled
  isDisabled = computed(() => this.isViewMode() || this.disabled());

  private fileupload = viewChild<FileUpload>("fileupload");
  private toasterService = inject(ToasterService);
  private attachmentService = inject(AttachmentService);

  constructor() {
    // Sync PrimeNG's internal files array when the model signal changes
    effect(() => {
      const modelFiles = this.files();
      const primeNgComponent = this.fileupload();

      if (primeNgComponent) {
        // Clean up old objectURLs to prevent memory leaks
        if (primeNgComponent.files) {
          primeNgComponent.files.forEach((file: any) => {
            if (file.objectURL) {
              URL.revokeObjectURL(file.objectURL);
            }
          });
        }

        // Sync PrimeNG's internal files array with the model signal
        if (modelFiles.length > 0) {
          // Clear existing files first
          if (primeNgComponent.files) {
            primeNgComponent.files.length = 0;
          }

          // Add files to PrimeNG's internal array with objectURL for preview
          modelFiles.forEach(file => {
            if (file instanceof File) {
              // Check if this is an existing attachment with fileUrl
              const existingFile = file as any;
              if (existingFile.isExistingAttachment && existingFile.fileUrl) {
                // For existing attachments, use the fileUrl from server instead of creating objectURL
                const fileWithUrl = Object.assign(file, { objectURL: existingFile.fileUrl });
                if (primeNgComponent.files) {
                  primeNgComponent.files.push(fileWithUrl);
                }
              } else {
                // Create objectURL for new file preview
                const objectURL = URL.createObjectURL(file);
                // Add file with objectURL to PrimeNG's files array
                const fileWithUrl = Object.assign(file, { objectURL });
                if (primeNgComponent.files) {
                  primeNgComponent.files.push(fileWithUrl);
                }
              }
            }
          });
        } else {
          // Clear PrimeNG's internal files array
          if (primeNgComponent.files) {
            primeNgComponent.files.length = 0;
          }
        }
      }
    });
  }

  clear!: () => void;

  clearFiles() {
    // Don't allow clearing in view mode or when disabled
    if (this.isDisabled()) {
      return;
    }

    this.fileupload()?.clear();
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (this.fileupload() as any).msgs = []; // hide PrimeNG internal messages
  }

  choose(event: unknown, callback: () => void) {
    callback();
  }

  chooseFiles() {
    this.fileupload()?.choose();
  }

  removeUploadedFile(index: number) {
    // Don't allow removal in view mode or when disabled
    if (this.isDisabled()) {
      return;
    }

    // Remove from your custom model
    const currentFiles = this.files().slice();
    currentFiles.splice(index, 1);
    this.files.set(currentFiles);

    // Also remove from PrimeNG internal files array to keep them in sync
    const primeNgFiles = this.fileupload()?.files;
    if (primeNgFiles) {
      primeNgFiles.splice(index, 1);
    }
  }

  onSelectedFiles(event: FileSelectEvent) {
    const acceptedTypes = this.acceptedFileTypes()
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const maxSize = this.maxFileSize();
    const maxTotalSize = 30 * 1024 * 1024; // 30 MB total limit
    const validFiles: File[] = [];

    for (const file of event.files) {
      // biome-ignore lint/style/useTemplate: <explanation>
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const isTypeAccepted = this.isFileTypeAccepted(file, ext, acceptedTypes);
      const isSizeAccepted = file.size <= maxSize;

      if (!isSizeAccepted) {
        this.toasterService.error(
          `${file.name}: File exceeds max size of ${Math.round(
            maxSize / (1024 * 1024),
          )}MB`,
        );
        continue;
      }

      if (!isTypeAccepted) {
        this.toasterService.error(`${file.name}: Invalid file type`);
        continue;
      }

      validFiles.push(file);
    }

    // If multiple is true, check total size of all files (existing + new)
    // if (this.multiple() && validFiles.length > 0) {
    //   const existingFiles = this.files();
    //   const allFiles = [...existingFiles, ...validFiles];
    //   const totalSize = allFiles.reduce((total, file) => total + file.size, 0);

    //   if (totalSize > maxTotalSize) {
    //     this.toasterService.error(
    //       `All uploaded files should be less than ${Math.round(maxTotalSize / (1024 * 1024))} MB`,
    //     );
    //     // Don't add the new files if total size exceeds limit
    //     return;
    //   }
    // }

    // If multiple is true and there are existing files, append new files instead of replacing
    if (this.multiple() && this.files().length > 0) {
      const existingFiles = this.files();
      this.files.set([...existingFiles, ...validFiles]);
    } else {
      this.files.set(validFiles);
    }

    // prevent PrimeNG from showing error messages in the UI
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (this.fileupload() as any).msgs = [];
  }

  private isFileTypeAccepted(
    file: File,
    ext: string,
    acceptedTypes: string[],
  ): boolean {
    // If accepted types is "*/*", accept all files
    if (this.acceptedFileTypes() === "*/*") {
      return true;
    }

    // Check if any of the accepted types match the file
    return acceptedTypes.some((acceptedType) => {
      // Handle MIME type patterns like "video/*", "image/*", etc.
      if (acceptedType.includes("/*")) {
        const mimeCategory = acceptedType.split("/")[0];
        return file.type.startsWith(`${mimeCategory}/`);
      }

      // Handle specific MIME types like "video/mp4", "image/jpeg", etc.
      if (acceptedType.includes("/")) {
        return file.type === acceptedType;
      }

      // Handle file extensions like ".mp4", ".jpg", etc.
      return ext === acceptedType;
    });
  }

  getFileIcon(file: File): string | null {
    // Check for ZIP files
    if (
      file.name.toLowerCase().endsWith('.zip') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed'
    ) {
      return 'assets/images/zip.png';
    }

    // Check for PDF files
    if (
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf'
    ) {
      return 'assets/images/pdf.png';
    }

    return null;
  }

  /**
   * Format file size in human-readable format (e.g., "2.5 MB", "500 KB")
   * Returns null if file size doesn't exist
   */
  formatFileSize(file: File): string | null {
    if (!file || file.size === undefined || file.size === null) {
      return null;
    }

    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  downloadFile(file: Attachment): void {
    const fileId = file.ibmIdentifier;

    if (!fileId) {
      this.toasterService.error("Unable to download file: missing attachment id.");
      return;
    }

    this.attachmentService.downloadAndSaveAttachment(fileId, file.fileName).subscribe({
      next: () => {
        // Download handled in service
      },
      error: () => {
        this.toasterService.error("An error occurred while downloading the file.");
      },
    });
  }
}
