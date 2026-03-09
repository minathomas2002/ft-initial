import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseLabelComponent } from "../../base-components/base-label/base-label.component";

@Component({
  selector: 'app-page-comment-box',
  imports: [NgClass, BaseLabelComponent],
  templateUrl: './page-comment-box.html',
  styleUrl: './page-comment-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCommentBox {
  commentTitle = input.required<string>();
  commentText = input.required<string>();
  colorsClassesConfig = input<Record<string, string>>({
    border: 'border-orange-500',
    background: 'bg-orange-50',
    iconColor: 'text-orange-500'
  })
  iconType = input<string>('icon-message-circle');

  showOwnCommentInput = computed(() => {
    const title = this.commentTitle()?.toLowerCase() ?? '';

    return title.includes('your') || title.includes('تعليقك');
  });
}
