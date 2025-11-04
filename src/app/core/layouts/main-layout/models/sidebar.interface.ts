export interface ISideBarLink {
	label: string;
	icon?: string;
	routerLink: string;
	show: boolean;
	children?: ISideBarLink[];
	external?: boolean;
}
