import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { AvatarModule } from "primeng/avatar";
import { ERoles } from "src/app/shared/enums/roles.enum";
import { SystemEmployeeRoleMapper } from "src/app/shared/classes/role.mapper";
import { I18nService } from "src/app/shared/services/i18n";
@Component({
	selector: "app-identify-user",
	imports: [AvatarModule,],
	templateUrl: "./identify-user.component.html",
	styleUrl: "./identify-user.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentifyUserComponent {
	private readonly i18nService = inject(I18nService);
	private readonly employeeRoleMapper = new SystemEmployeeRoleMapper(this.i18nService);

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
	userRole = input<string | number>("");

	readonly userRoleText = computed(() => {
		const raw = this.userRole();
		if (raw === null || raw === undefined) return '';
		if (typeof raw === 'number') return this.employeeRoleMapper.getTranslatedRole(raw as ERoles);
		const text = String(raw).trim();
		if (!text) return '';
		if (/^\d+$/.test(text)) return this.employeeRoleMapper.getTranslatedRole(Number(text) as ERoles);
		return text;
	});
}
