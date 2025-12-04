import { Component, effect, inject, input, model, viewChild, afterNextRender } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import {
  type FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";
import { ImageErrorDirective } from "../../../directives/image-error.directive";

@Component({
  selector: "app-fileupload",
  imports: [FileUploadModule, ButtonModule, ToastModule, ImageErrorDirective],
  templateUrl: "./fileupload.component.html",
  styleUrl: "./fileupload.component.scss",
  providers: [MessageService],
})
export class FileuploadComponent {
  maxFileSize = input<number>(1024 * 1024 * 10); // 10MB default
  acceptedFileTypes = input<string>("*/*");
  files = model<File[]>([]);
  placeholder = input("SVG, PNG, JPG, PDF, DOCX, MP4");

  private fileupload = viewChild<FileUpload>("fileupload");
  private toasterService = inject(ToasterService);

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
              // Create objectURL for file preview
              const objectURL = URL.createObjectURL(file);
              // Add file with objectURL to PrimeNG's files array
              const fileWithUrl = Object.assign(file, { objectURL });
              if (primeNgComponent.files) {
                primeNgComponent.files.push(fileWithUrl);
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

    this.files.set(validFiles);

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
}
