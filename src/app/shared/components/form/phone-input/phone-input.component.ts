import { Component, input, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IPhoneValue, ICountry } from './phone-input.interface';
import { COUNTRIES } from './countries.data';

@Component({
	selector: 'app-phone-input',
	standalone: true,
	imports: [SelectModule, InputTextModule, FormsModule, ReactiveFormsModule],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: PhoneInputComponent,
			multi: true,
		},
	],
	templateUrl: './phone-input.component.html',
	styleUrl: './phone-input.component.scss',
})
export class PhoneInputComponent implements ControlValueAccessor {
	countries = COUNTRIES;
	placeholder = input<string>('Enter phone number');
	disabled = input<boolean>(false);
	styleClass = input<string>('');
	defaultCountryCode = input<string>('+966'); // Default to Saudi Arabia

	// Internal state
	selectedCountry = signal<ICountry>(this.getDefaultCountry());
	phoneNumber = signal<string>('');

	private getDefaultCountry(): ICountry {
		const defaultCode = this.defaultCountryCode();
		const country = this.countries.find((c) => c.dialCode === defaultCode);
		return country || this.countries.find((c) => c.code === 'SA') || this.countries[0];
	}

	// Validation state getters
	get isDirty(): boolean {
		return this._dirty;
	}

	get isTouched(): boolean {
		return this._touched;
	}

	// Computed values
	filteredCountries = computed(() => this.countries);

	// ControlValueAccessor implementation
	private onChange = (value: IPhoneValue | null) => {};
	private onTouched = () => {};
	_isDisabled = false;
	_touched = false;
	_dirty = false;

	onCountryChange(country: ICountry | null) {
		if (country) {
			// Ensure we use the object reference from the countries array
			const countryFromArray = this.countries.find((c) => c.code === country.code);
			if (countryFromArray) {
				this.selectedCountry.set(countryFromArray);
				this._dirty = true;
				this.updateValue();
			}
		}
	}

	onCountrySelectBlur() {
		this._touched = true;
		this.onTouched();
	}

	onPhoneNumberChange(phone: string) {
		this.phoneNumber.set(phone);
		this._dirty = true;
		this.updateValue();
	}

	onPhoneInputBlur() {
		this._touched = true;
		this.onTouched();
	}

	private updateValue() {
		const country = this.selectedCountry();
		const phone = this.phoneNumber();
		const newValue: IPhoneValue = {
			countryCode: country.dialCode,
			phoneNumber: phone,
		};
		this.onChange(newValue);
	}

	// ControlValueAccessor methods
	writeValue(value: IPhoneValue | null): void {
		if (value && value.countryCode && value.phoneNumber) {
			const country = this.countries.find((c) => c.dialCode === value.countryCode);
			if (country) {
				this.selectedCountry.set(country);
			}
			this.phoneNumber.set(value.phoneNumber || '');
		} else {
			// Reset to default country (Saudi Arabia) when value is null or empty
			this.selectedCountry.set(this.getDefaultCountry());
			this.phoneNumber.set('');
			this._dirty = false;
			this._touched = false;
		}
	}

	registerOnChange(fn: (value: IPhoneValue | null) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._isDisabled = isDisabled;
	}
}

