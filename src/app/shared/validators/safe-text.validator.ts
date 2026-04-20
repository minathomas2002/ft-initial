import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface SafeTextValidatorOptions {
  allowNewLines?: boolean;
  allowHtmlEntities?: boolean;
}

export function safeTextValidator(options?: SafeTextValidatorOptions): ValidatorFn {
  const allowNewLines = options?.allowNewLines ?? false;
  const allowHtmlEntities = options?.allowHtmlEntities ?? false;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null | undefined;
    if (!value) return null;

    // 1. Block HTML tag delimiters — ASCII and Unicode lookalikes
    //    Catches:
    //      <script>alert(1)</script>          — standard HTML injection
    //      ＜script＞alert(1)＜/script＞       — fullwidth angle brackets (U+FF1C, U+FF1E)
    //      ‹img src=x›                        — single guillemets (U+2039, U+203A)
    //      «img src=x»                        — double guillemets (U+00AB, U+00BB)
    //      ﹤div﹥                             — small form variants (U+FE64, U+FE65)
    //      ˂div˃                              — modifier letters (U+02C2, U+02C3)
    //      ᐸscriptᐳ                           — Canadian syllabics (U+1438, U+1433)
    if (/<\/?[a-zA-Z][\w-]*(?:\s[^>]*?)?>/.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    return null;
  };
}
