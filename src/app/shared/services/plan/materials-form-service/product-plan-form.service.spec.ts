import { TestBed } from '@angular/core/testing';
import { ProductPlanFormService } from './product-plan-form-service';


describe('ProductPlanFormService', () => {
	let service: (ProductPlanFormService)

	beforeEach(() => {
		TestBed.configureTestingModule({
		});
		service = TestBed.inject(ProductPlanFormService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

