import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AvatarModule } from "primeng/avatar";
@Component({
	selector: "app-identify-user",
	imports: [AvatarModule,],
	templateUrl: "./identify-user.component.html",
	styleUrl: "./identify-user.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentifyUserComponent {
	userAvatar = input<string>(
		"https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png",
	);
	avatarClass = input<string>("!w-[40px] !h-[40px]");
	titleClass = input<string>("font-medium text-gray-900");
	subTitleClass = input<string>("text-sm font-normal text-gray-600");
	departmentClass = input<string>("text-sm font-normal text-gray-600");
	roleClass = input<string>("text-sm font-normal text-gray-600");

	userName = input<string>("User User");
	userTitle = input<string>("");
	userDepartment = input<string>("");
	userRole = input<string>("");
}
