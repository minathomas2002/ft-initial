import {
	trigger,
	transition,
	style,
	animate,
	query,
	group,
	animateChild,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
	transition('* <=> *', [
		style({ position: 'relative', minHeight: '100vh' }),
		query(
			':enter, :leave',
			[
				style({
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
				}),
			],
			{ optional: true },
		),
		query(':enter', [style({ transform: 'translateX(-2%)' })], { optional: true }),
		query(':leave', animateChild(), { optional: true }),
		group([
			query(
				':leave',
				[animate('200ms ease-out', style({ transform: 'translateX(2%)', opacity: 0 }))],
				{
					optional: true,
				},
			),
			query(':enter', [animate('300ms ease-out', style({ transform: 'translateX(0%)' }))], {
				optional: true,
			}),
			query('@*', animateChild(), { optional: true }),
		]),
	]),
]);

export const slideInOutAnimation = trigger('slideInOutAnimation', [
	transition('*<=>*', [
		style({ opacity: 0, transform: 'translateY(-0.5%)' }),
		animate('0.5s ease-in-out', style({ opacity: 1, transform: 'translateX(0)' })),
	]),
]);

export const routeFadeAnimation = trigger('routeFadeAnimation', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-10%)' }),
		animate('1s ease-in-out', style({ opacity: 1, transform: 'translateY(0)' })),
	]),
	transition(':leave', [
		animate('1s ease-in-out', style({ opacity: 0, transform: 'translateY(-10%)' })),
	]),
]);
