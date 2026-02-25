import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-personal-information-skeleton',
  imports: [SkeletonModule],
  templateUrl: './personal-information-skeleton.html',
  styleUrl: './personal-information-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationSkeleton {
  /** Number of form fields to show as skeleton placeholders */
  numberOfFields = input<number>(6);

  /** When true, shows skeleton; when false, projects the content */
  isLoading = input<boolean>(true);

  fieldIndices = computed(() =>
    Array.from({ length: this.numberOfFields() }, (_, i) => i)
  );
}
