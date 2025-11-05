# I18n Service Usage Guide

This project uses a custom i18n (internationalization) service for managing translations.

## Features

- Support for multiple languages (English and Arabic by default)
- Signal-based reactive translations
- Automatic language detection from browser/localStorage
- Translation files stored as JSON
- Simple API for translating text

## Usage

### 1. Using the Translate Pipe in Templates

```html
<!-- Simple translation -->
<h1>{{ 'common.welcome' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'auth.welcomeMessage' | translate: { name: 'John' } }}</p>
```

### 2. Using the Service in Components

```typescript
import { Component, inject } from '@angular/core';
import { I18nService } from '@shared/services/i18n/i18n.service';

@Component({
  // ...
})
export class MyComponent {
  private readonly i18n = inject(I18nService);

  getMessage(): string {
    return this.i18n.translate('common.welcome');
  }

  getMessageWithParams(): string {
    return this.i18n.translate('auth.welcomeMessage', { name: 'John' });
  }

  // Short alias
  t(key: string): string {
    return this.i18n.t(key);
  }
}
```

### 3. Changing Language Programmatically

```typescript
import { I18nService } from '@shared/services/i18n/i18n.service';

// In your component
this.i18n.setLanguage('ar'); // Switch to Arabic
this.i18n.setLanguage('en'); // Switch to English
```

### 4. Accessing Current Language

```typescript
// Read-only signal
const currentLang = this.i18n.currentLanguage();

// Use in template
{{ i18n.currentLanguage() }}
```

### 5. Using the Language Switcher Component

```html
<app-language-switcher></app-language-switcher>
```

## Adding New Translations

1. Open the translation file for your language: `src/assets/i18n/{lang}.json`
2. Add your translation keys in nested object format:

```json
{
  "mySection": {
    "myKey": "My Translation",
    "myKeyWithParam": "Hello {{name}}"
  }
}
```

3. Use in your code: `{{ 'mySection.myKey' | translate }}`

## Supported Languages

- `en` - English
- `ar` - Arabic

To add more languages:
1. Create a new JSON file in `src/assets/i18n/`
2. Add the language code to the `SupportedLanguage` type in `i18n.service.ts`
3. Update the language switcher component's language options

## Language Persistence

The selected language is automatically saved to localStorage and restored on app reload.

