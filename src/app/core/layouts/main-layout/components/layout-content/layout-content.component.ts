import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";


import { AnimationsContext } from "../../../../../shared/classes/animations";
import { slideInOutAnimation } from "../../../../animations/animations.animation";

@Component({
	selector: "app-layout-content",
	imports: [RouterOutlet],
	templateUrl: "./layout-content.component.html",
	styleUrl: "./layout-content.component.scss",
	animations: [slideInOutAnimation],
})
export class LayoutContentComponent extends AnimationsContext {}
