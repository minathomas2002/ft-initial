import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-cards-skeleton',
  imports: [SkeletonModule,
    NgTemplateOutlet, 
    CardModule,
    ButtonModule
  ],
  templateUrl: './cards-skeleton.html',
  styleUrl: './cards-skeleton.scss',
})
export class CardsSkeleton {
  count = input<number>(9)
  items = computed(() => Array.from({ length: this.count() }).map((_, i) => `Item #${i}`))
  isLoading = input<boolean>(true);
}
