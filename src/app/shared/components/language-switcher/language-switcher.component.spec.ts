import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { I18nService } from '../../services/i18n/i18n.service';
import { TranslateService } from '../../services/i18n/translate.service';

describe('LanguageSwitcherComponent', () => {
	let component: LanguageSwitcherComponent;
	let fixture: ComponentFixture<LanguageSwitcherComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LanguageSwitcherComponent],
			providers: [I18nService, TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(LanguageSwitcherComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

