# Angular i18n with XLF Files

This project uses Angular's built-in i18n system with XLF (XML Localization Interchange Format) files for internationalization.

## Overview

- **Source file**: `messages.xlf` - Contains all translatable strings from your templates
- **Translation files**: `messages.{locale}.xlf` - Contains translations for each language (e.g., `messages.ar.xlf` for Arabic)

## Workflow

### 1. Add i18n Attributes to Templates

Add the `i18n` attribute to any HTML element you want to translate:

```html
<!-- Simple translation -->
<h1 i18n>Welcome</h1>

<!-- With description and meaning -->
<h1 i18n="Login page title|An introduction header for the login page">Login</h1>

<!-- Attribute translation -->
<input placeholder="Enter email" i18n-placeholder="Email input placeholder" />

<!-- With context -->
<button i18n="@@saveButton">Save</button>
```

**i18n Attribute Syntax:**
- `i18n` - Simple translation
- `i18n="meaning|description"` - With meaning and description
- `i18n="@@customId"` - With custom ID
- `i18n-attributeName` - For translating HTML attributes

### 2. Extract Translation Strings

Run the extract command to generate/update the XLF file:

```bash
ng extract-i18n
```

This will:
- Scan all templates for `i18n` attributes
- Generate/update `src/locale/messages.xlf` with all translatable strings
- Preserve existing translations in locale-specific files

### 3. Edit Translation Files

#### Main Source File (`messages.xlf`)
This file contains the source strings. Don't edit the `<source>` tags - they're generated from your templates.

#### Language-Specific Files (`messages.{locale}.xlf`)
For each language, create a copy of `messages.xlf` and:
1. Add `trgLang="{locale}"` to the `<xliff>` tag (e.g., `trgLang="ar"`)
2. Add `<target>` tags with translations inside each `<segment>`

Example:
```xml
<unit id="1330897510263894361">
  <segment>
    <source>Login</source>
    <target>تسجيل الدخول</target>  <!-- Arabic translation -->
  </segment>
</unit>
```

### 4. Build for Specific Locale

Build the application for a specific locale:

```bash
# English (en-US)
ng build --configuration=en

# Arabic
ng build --configuration=ar
```

### 5. Serve with Locale

Serve the application with a specific locale:

```bash
# English
ng serve --configuration=en

# Arabic
ng serve --configuration=ar
```

## Available Locales

- **en-US** (English) - Default/source locale
- **ar** (Arabic)

To add more locales:
1. Copy `messages.xlf` to `messages.{locale}.xlf`
2. Update `trgLang` attribute
3. Add translations in `<target>` tags
4. Add build configuration in `angular.json`

## File Structure

```
src/
  locale/
    messages.xlf          # Source file (English)
    messages.ar.xlf       # Arabic translations
    messages.{locale}.xlf # Other language translations
```

## Best Practices

1. **Always extract before building**: Run `ng extract-i18n` after adding new i18n attributes
2. **Use meaningful IDs**: Use `@@customId` for important strings that need stable IDs
3. **Provide context**: Use description and meaning to help translators understand context
4. **Keep translations updated**: When you add new strings, extract and update all locale files
5. **Test each locale**: Build and test the application in each language

## Common i18n Patterns

### Text Content
```html
<p i18n>Hello World</p>
```

### With Variables (ICU Expressions)
```html
<span i18n>Updated {minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}</span>
```

### Attributes
```html
<img src="logo.png" alt="Company Logo" i18n-alt="Company logo alt text" />
```

### Custom IDs
```html
<button i18n="@@saveButton">Save</button>
```

## Troubleshooting

- **Missing translations**: Make sure `<target>` tags are added to locale files
- **Build errors**: Verify locale files are valid XML
- **Not updating**: Run `ng extract-i18n` again after template changes
- **Wrong locale**: Check `angular.json` build configurations match your locale files

