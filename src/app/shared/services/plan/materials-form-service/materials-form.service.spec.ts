import { TestBed } from '@angular/core/testing';
import { MaterialsFormService } from './materials-form-service';


describe('MaterialsFormService', () => {
	let service: MaterialsFormService;

	beforeEach(() => {
		TestBed.configureTestingModule({
		});
		service = TestBed.inject(MaterialsFormService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

