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
    if (/[<>\uFF1C\uFF1E\u2039\u203A\u00AB\u00BB\uFE64\uFE65\u02C2\u02C3\u1438\u1433]/.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 2. Block HTML entities that browsers or servers could decode into markup
    //    Catches:
    //      &lt;script&gt;alert(1)&lt;/script&gt;   — named entities
    //      &#60;script&#62;                         — decimal numeric entities
    //      &#x3C;script&#x3E;                       — hexadecimal numeric entities
    //      &amp;                                    — ampersand entity
    if (!allowHtmlEntities && /&(?:#\d+|#x[\da-f]+|[a-z]{2,6});/i.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 3. Block dangerous URL schemes after stripping ALL invisible characters
    //    Catches:
    //      javascript:alert(1)                — standard scheme
    //      j a v a s c r i p t:alert(1)       — ASCII space obfuscation
    //      j\u200Bavascript:alert(1)          — zero-width space inserted (U+200B)
    //      java\u200Dscript:alert(1)          — zero-width joiner inserted (U+200D)
    //      java\uFEFFscript:alert(1)          — BOM character inserted (U+FEFF)
    //      data:text/html,<script>...</script> — data URI with HTML payload
    //      vbscript:MsgBox("XSS")             — VBScript scheme (IE)
    //      blob:https://evil.com/uuid         — blob URI referencing injected content
    const compressedValue = value.replace(
      /[\s\u0000-\u001F\u007F\u00A0\u200B-\u200F\u2028-\u202F\uFEFF]/g,
      ''
    );
    if (/(?:javascript|data|vbscript|blob):/i.test(compressedValue)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 4. Block template injection patterns (works across newlines with [\s\S])
    //    Catches:
    //      {{constructor.constructor('alert(1)')()}}   — Angular expression injection
    //      ${7*7}                                      — ES6 template literal / Jinja2
    //      #{runtime.exec("cmd")}                      — Java EL / Pug injection
    //      <% require('child_process').exec('rm -rf') %> — ERB / EJS server-side
    //      [[${session.getAttribute('admin')}]]        — Thymeleaf injection
    //      ${\nalert(1)\n}                             — multi-line payload (missed by . without s flag)
    if (/\{\{[\s\S]*?\}\}|\$\{[\s\S]*?\}|#\{[\s\S]*?\}|<%[\s\S]*?%>|\[\[[\s\S]*?\]\]/.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 5. Block inline event handler patterns, tolerating separators between name and =
    //    Catches:
    //      onerror=alert(1)                   — standard event handler
    //      onload = alert(1)                  — whitespace around =
    //      onfocus/=/alert(1)                 — slash separator obfuscation
    //      onmouseover  =  fetch('...')       — multi-space obfuscation
    //      ONERROR=alert(1)                   — case-insensitive bypass attempt
    if (/\bon\w+[\s/]*=/i.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 6. Block non-printable control characters and invisible Unicode
    //    Catches:
    //      \u0000 (NULL)                      — null byte injection to truncate strings
    //      \u0008 (BACKSPACE)                 — terminal manipulation
    //      \u001B (ESCAPE)                    — ANSI escape sequence injection
    //      \u007F (DELETE)                    — control character
    //      \u200B (ZERO WIDTH SPACE)          — invisible character to obfuscate payloads
    //      \u200E (LTR MARK)                 — bidirectional text spoofing
    //      \u200F (RTL MARK)                 — bidirectional text spoofing
    //      \u2028 (LINE SEPARATOR)           — JavaScript line terminator injection
    //      \u2029 (PARAGRAPH SEPARATOR)      — JavaScript line terminator injection
    //      \uFEFF (BOM / ZERO WIDTH NO-BREAK SPACE) — invisible prefix/obfuscation
    //    When allowNewLines is true, \t (U+0009), \n (U+000A), and \r (U+000D) are permitted.
    const controlCharsPattern = allowNewLines
      ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202F\uFEFF]/
      : /[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F\uFEFF]/;
    if (controlCharsPattern.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    // 7. SQL injection heuristics (defense in depth — primary defense must be server-side)
    //    Catches:
    //      ' OR 1=1 --                        — classic authentication bypass
    //      ' AND ''='                         — tautology-based injection
    //      '; DROP TABLE users --             — destructive statement injection
    //      '; DELETE FROM accounts --         — data deletion
    //      ' UNION SELECT password FROM users — data exfiltration via UNION
    //      '; UPDATE users SET role='admin' -- — privilege escalation
    //      '; INSERT INTO logs VALUES('x') -- — data insertion
    //      ' OR 'a'='a' --                    — string-based tautology
    if (/('.*(\bOR\b|\bAND\b|\bUNION\b).*)|(--)|(;\s*(DROP|ALTER|DELETE|UPDATE|INSERT)\b)/i.test(value)) {
      return { potentiallyMaliciousCharacters: true };
    }

    return null;
  };
}
