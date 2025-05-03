import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderByDate' })
export class OrderByDatePipe implements PipeTransform {
  transform(array: any[], field: string): any[] {
    if (!Array.isArray(array)) return [];
    return array.sort((a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime());
  }
}
