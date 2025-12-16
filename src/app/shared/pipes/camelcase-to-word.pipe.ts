import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCaseToWord'
})
export class CamelCaseToWordPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    return value
      // camelCase → camel Case
      .replace(/([a-z])([A-Z])/g, '$1 $2')

      // letterNumber → letter Number (year2 → year 2)
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')

      // numberLetter → number Letter (2Year → 2 Year)
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')

      // Capitalize first letter
      .replace(/^./, char => char.toUpperCase());
  }
}
