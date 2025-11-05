import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { TranslateService } from './translate.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('I18nService', () => {
	let service: I18nService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [I18nService, TranslateService],
		});
		service = TestBed.inject(I18nService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

