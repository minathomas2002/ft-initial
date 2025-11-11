import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
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
  items = Array.from({ length: 9 }).map((_, i) => `Item #${i}`);
  isLoading = input<boolean>(true);
}
