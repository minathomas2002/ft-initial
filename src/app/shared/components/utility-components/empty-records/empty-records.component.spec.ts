import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { EmptyRecordsComponent } from "./empty-records.component";

@Component({
	template: `
    <app-empty-records title="Test Title" subtitle="Test Subtitle" icon="test-icon">
      <button>Test Button</button>
    </app-empty-records>
  `,
})
class TestHostComponent {}

describe("EmptyRecordsComponent", () => {
	let fixture: ComponentFixture<TestHostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [EmptyRecordsComponent],
			declarations: [TestHostComponent],
		}).compileComponents();
		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();
	});

	it("should render title, subtitle, icon, and ng-content", () => {
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector("h3")?.textContent).toContain("Test Title");
		expect(compiled.querySelector("p")?.textContent).toContain("Test Subtitle");
		expect(compiled.querySelector("i")?.className).toContain("test-icon");
		expect(compiled.querySelector("button")?.textContent).toContain(
			"Test Button",
		);
	});
});
