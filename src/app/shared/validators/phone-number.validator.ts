import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator for mobile phone numbers
 * Validates that the phone number contains only digits and is between 7-15 digits
 * This follows ITU-T E.164 standard for national number part (excluding country code)
 * 
 * Works with both IPhoneValue ({countryCode, phoneNumber}) and IPhoneNumberControl ({dialCode, nationalNumber})
 */
export function phoneNumberPatternValidator(): (control: AbstractControl) => ValidationErrors | null {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;

		// Allow empty (will be caught by required validator)
		if (!value) {
			return null;
		}

		// Handle both IPhoneValue and IPhoneNumberControl structures
		let phoneNumber: string | null = null;
		
		if (value.phoneNumber !== undefined) {
			// IPhoneValue structure: {countryCode, phoneNumber}
			phoneNumber = value.phoneNumber;
		} else if (value.nationalNumber !== undefined) {
			// IPhoneNumberControl structure: {dialCode, nationalNumber}
			phoneNumber = value.nationalNumber;
		}

		if (!phoneNumber || phoneNumber.trim() === '') {
			return null;
		}

		const trimmedPhone = phoneNumber.trim();

		// Mobile number pattern: only digits, 7-15 digits long
		// This covers most international mobile number formats
		const mobilePattern = /^[0-9]{7,15}$/;

		if (!mobilePattern.test(trimmedPhone)) {
			return { invalidPhoneNumber: true };
		}

		return null;
	};
}

