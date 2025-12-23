import { Component, input } from '@angular/core';
import { Avatar } from "primeng/avatar";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: 'app-user-identify',
  imports: [Avatar, Tooltip],
  templateUrl: './user-identify.html',
  styleUrl: './user-identify.scss',
})
export class UserIdentify {

  userAvatar = input<string>(
		"https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png",
	);
	avatarClass = input<string>("!w-[40px] !h-[40px]");
	titleClass = input<string>("font-medium text-gray-900");
	subTitleClass = input<string>("text-sm font-normal text-gray-600");
	departmentClass = input<string>("text-sm font-normal text-gray-600");
	userName = input<string>("User User");
	userRole = input<string>("Role");


}
