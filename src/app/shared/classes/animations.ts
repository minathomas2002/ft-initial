import { inject } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';

export class AnimationsContext {
	protected contexts = inject(ChildrenOutletContexts);

	getRouteAnimationData() {
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
	}
}
