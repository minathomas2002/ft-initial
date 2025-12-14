import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { ISideBarLink } from '../../models';

@Component({
	selector: 'app-sidebar-link',
	imports: [RouterModule],
	templateUrl: './sidebar-link.component.html',
	styleUrl: './sidebar-link.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLinkComponent {
	link = input.required<ISideBarLink>();
}
