import { Component, input, computed, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IPhoneValue, ICountry } from '../../../interfaces';
import { COUNTRIES } from '../../../data/countries.data';

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
	private onChange = (value: IPhoneValue | null) => { };
	private onTouched = () => { };
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
		// Mark as dirty when user changes the value (even if clearing it)
		if (!this._dirty) {
			this._dirty = true;
		}
		this.updateValue();
	}

	onPhoneInputBlur() {
		this._touched = true;
		this.onTouched();
	}

	private updateValue() {
		const country = this.selectedCountry();
		const phone = this.phoneNumber();

		// If phone number is empty, send null to trigger required validator
		if (!phone || phone.trim() === '') {
			this.onChange(null);
		} else {
			const newValue: IPhoneValue = {
				countryCode: country.dialCode,
				phoneNumber: phone,
			};
			this.onChange(newValue);
		}
	}

	// ControlValueAccessor methods
	writeValue(value: IPhoneValue | null): void {
		if (value && value.countryCode && value.phoneNumber) {
			const country = this.countries.find((c) => c.dialCode === value.countryCode);
			if (country) {
				this.selectedCountry.set(country);
			}
			this.phoneNumber.set(value.phoneNumber || '');
		} else if (value === null) {
			// When value is null (user cleared the field or form reset)
			// If field was already dirty/touched, user cleared it - keep those states
			// If field was not dirty/touched, it's a programmatic reset - reset to default
			if (!this._dirty && !this._touched) {
				// Programmatic reset - reset to default country
				this.selectedCountry.set(this.getDefaultCountry());
				this.phoneNumber.set('');
				this._dirty = false;
				this._touched = false;
			} else {
				// User cleared the field - keep dirty/touched, just clear phone number
				this.phoneNumber.set('');
				// Keep the current country selection
			}
		} else {
			// Value is undefined - full reset
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

