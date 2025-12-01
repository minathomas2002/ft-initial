import {
  Component,
  OutputEmitterRef,
  computed,
  input,
  output,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { OpportunityActionsMapper } from '../../../../features/opportunities/classes/opportunity-actions-mapper';
import { EOpportunityAction } from '../../../enums/opportunities.enum';
import { I18nService } from '../../../services/i18n/i18n.service';

@Component({
  selector: 'app-opportunity-action-menu',
  imports: [MenuModule, ButtonModule],
  templateUrl: './opportunity-action-menu.component.html',
  styleUrl: './opportunity-action-menu.component.scss',
})
export class OpportunityActionMenuComponent {
  actions = input.required<EOpportunityAction[]>();
  opportunityActionsMapper = new OpportunityActionsMapper();
  private readonly i18nService = inject(I18nService);
  hasLabel = input<boolean>(false);
  onEdit = output();
  onDelete = output();
  onMoveToDraft = output();
  onPublish = output();
  onApply = output();

  isOpen = signal<boolean>(false);
  handleEventsMapper: Partial<
    Record<EOpportunityAction, OutputEmitterRef<void>>
  > = {
      [EOpportunityAction.Edit]: this.onEdit,
      [EOpportunityAction.Delete]: this.onDelete,
      [EOpportunityAction.MoveToDraft]: this.onMoveToDraft,
      [EOpportunityAction.Publish]: this.onPublish,
      [EOpportunityAction.Apply]: this.onApply,
    };

  menuItems = computed<MenuItem[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();

    return this.opportunityActionsMapper.getActions(this.actions()).map((mItem) => {
      return {
        ...mItem,
        label: this.i18nService.translate(mItem.label ?? ''),
        command: () => {
          this.handleEventsMapper[mItem.key]?.emit();
        },
      };
    });
  });

  toggleMenu() {
    this.isOpen.set(!this.isOpen());
  }
}

