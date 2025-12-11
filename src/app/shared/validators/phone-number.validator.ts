import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Phone number validation rules for different countries
 * Key: country dial code (e.g., '+966', '+1')
 * Value: { pattern: RegExp, minLength: number, maxLength: number, description: string }
 */
const COUNTRY_PHONE_PATTERNS: Record<string, { pattern: RegExp; minLength: number; maxLength: number; description: string }> = {
	// Saudi Arabia
	'+966': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits (e.g., 501234567)' },
	// United Arab Emirates
	'+971': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits (e.g., 501234567)' },
	// Kuwait
	'+965': { pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, description: '8 digits (e.g., 50123456)' },
	// Qatar
	'+974': { pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, description: '8 digits (e.g., 50123456)' },
	// Bahrain
	'+973': { pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, description: '8 digits (e.g., 50123456)' },
	// Oman
	'+968': { pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, description: '8 digits (e.g., 50123456)' },
	// Jordan
	'+962': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits (e.g., 791234567)' },
	// Lebanon
	'+961': { pattern: /^[0-9]{7,8}$/, minLength: 7, maxLength: 8, description: '7-8 digits' },
	// Egypt
	'+20': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits (e.g., 1012345678)' },
	// United States / Canada
	'+1': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits (e.g., 2015551234)' },
	// United Kingdom
	'+44': { pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, description: '10-11 digits' },
	// India
	'+91': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits (e.g., 9876543210)' },
	// Pakistan
	'+92': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Bangladesh
	'+880': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Turkey
	'+90': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Germany
	'+49': { pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, description: '10-11 digits' },
	// France
	'+33': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Italy
	'+39': { pattern: /^[0-9]{9,10}$/, minLength: 9, maxLength: 10, description: '9-10 digits' },
	// Spain
	'+34': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Australia
	'+61': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// China
	'+86': { pattern: /^[0-9]{11}$/, minLength: 11, maxLength: 11, description: '11 digits' },
	// Japan
	'+81': { pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, description: '10-11 digits' },
	// South Korea
	'+82': { pattern: /^[0-9]{9,10}$/, minLength: 9, maxLength: 10, description: '9-10 digits' },
	// Brazil
	'+55': { pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, description: '10-11 digits' },
	// Russia
	'+7': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Iran
	'+98': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Iraq
	'+964': { pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, description: '10 digits' },
	// Yemen
	'+967': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Syria
	'+963': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Tunisia
	'+216': { pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, description: '8 digits' },
	// Morocco
	'+212': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Algeria
	'+213': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Libya
	'+218': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Sudan
	'+249': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
	// Palestine
	'+970': { pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, description: '9 digits' },
};

/**
 * Gets the validation pattern for a specific country code
 * @param countryCode - The country dial code (e.g., '+966', '+1')
 * @returns The validation pattern or null if not found
 */
function getCountryValidationPattern(countryCode: string | null | undefined): { pattern: RegExp; minLength: number; maxLength: number; description: string } | null {
	if (!countryCode) {
		return null;
	}
	return COUNTRY_PHONE_PATTERNS[countryCode] || null;
}

/**
 * Validator for mobile phone numbers with country-specific validation
 * Validates phone numbers based on the country code provided
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
		let countryCode: string | null = null;
		
		if (value.phoneNumber !== undefined) {
			// IPhoneValue structure: {countryCode, phoneNumber}
			phoneNumber = value.phoneNumber;
			countryCode = value.countryCode;
		} else if (value.nationalNumber !== undefined) {
			// IPhoneNumberControl structure: {dialCode, nationalNumber}
			phoneNumber = value.nationalNumber;
			countryCode = value.dialCode;
		}

		if (!phoneNumber || phoneNumber.trim() === '') {
			return null;
		}

		const trimmedPhone = phoneNumber.trim();

		// Get country-specific validation pattern
		const countryPattern = getCountryValidationPattern(countryCode);

		if (countryPattern) {
			// Validate with country-specific pattern
			const length = trimmedPhone.length;
			
			if (length < countryPattern.minLength || length > countryPattern.maxLength) {
				return {
					invalidPhoneNumber: true,
					expectedLength: `${countryPattern.minLength}${countryPattern.maxLength !== countryPattern.minLength ? `-${countryPattern.maxLength}` : ''} digits`,
					description: countryPattern.description,
				};
			}

			if (!countryPattern.pattern.test(trimmedPhone)) {
				return {
					invalidPhoneNumber: true,
					expectedLength: `${countryPattern.minLength}${countryPattern.maxLength !== countryPattern.minLength ? `-${countryPattern.maxLength}` : ''} digits`,
					description: countryPattern.description,
				};
			}
		} else {
			// Fallback: Generic validation for countries without specific patterns
			// Mobile number pattern: only digits, 7-15 digits long
			// This follows ITU-T E.164 standard for national number part (excluding country code)
			const mobilePattern = /^[0-9]{7,15}$/;

			if (!mobilePattern.test(trimmedPhone)) {
				return { invalidPhoneNumber: true };
			}
		}

		return null;
	};
}

