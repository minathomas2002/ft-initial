import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BaseAlertComponent } from "./base-alert.component";

describe("BaseAlertComponent", () => {
	let component: BaseAlertComponent;
	let fixture: ComponentFixture<BaseAlertComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BaseAlertComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(BaseAlertComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	it("should render with default type (info)", () => {
		fixture.detectChanges();
		const alertElement = fixture.debugElement.query(By.css("div"));
		expect(alertElement.classes["border-blue-600"]).toBeTruthy();
		expect(alertElement.classes["bg-blue-50"]).toBeTruthy();
	});

	it("should render with warning type", () => {
		fixture.componentRef.setInput("type", "warning");
		fixture.detectChanges();
		const alertElement = fixture.debugElement.query(By.css("div"));
		expect(alertElement.classes["border-yellow-600"]).toBeTruthy();
		expect(alertElement.classes["bg-yellow-50"]).toBeTruthy();
	});

	it("should render title when provided", () => {
		fixture.componentRef.setInput("title", "Test Title");
		fixture.detectChanges();
		const titleElement = fixture.debugElement.query(
			By.css(".text-sm.font-semibold"),
		);
		expect(titleElement.nativeElement.textContent).toContain("Test Title");
	});

	it("should render message with HTML content", () => {
		fixture.componentRef.setInput("message", "Test <b>Message</b>");
		fixture.detectChanges();
		const messageElement = fixture.debugElement.query(
			By.css(".max-w-\\[700px\\]"),
		);
		expect(messageElement.nativeElement.innerHTML).toContain(
			"Test <b>Message</b>",
		);
	});

	it("should show close button by default", () => {
		fixture.detectChanges();
		const closeButton = fixture.debugElement.query(By.css(".icon-close"));
		expect(closeButton).toBeTruthy();
	});

	it("should hide close button when showClose is false", () => {
		fixture.componentRef.setInput("showClose", false);
		fixture.detectChanges();
		const closeButton = fixture.debugElement.query(By.css(".icon-close"));
		expect(closeButton).toBeFalsy();
	});

	it("should emit onClose event when close button is clicked", () => {
		const onCloseSpy = spyOn(component.onClose, "emit");
		fixture.detectChanges();
		const closeButton = fixture.debugElement.query(
			By.css(".icon-close"),
		)?.parent;
		if (closeButton) {
			closeButton.triggerEventHandler("click");
			expect(onCloseSpy).toHaveBeenCalled();
		}
	});

	it("should have correct icon for each type", () => {
		const types = ["info", "warning", "error", "success"] as const;
		for (const type of types) {
			fixture.componentRef.setInput("type", type);
			fixture.detectChanges();
			const iconElement = fixture.debugElement.query(By.css("i"));
			expect(
				iconElement.classes[`icon-${type === "info" ? "info-circle" : type}`],
			).toBeTruthy();
		}
	});
});
