import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stores'
})
export class StoresPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
