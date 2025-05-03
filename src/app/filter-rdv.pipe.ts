import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterRdv'
})
export class FilterRdvPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    if (!items || !searchTerm) return items;
    searchTerm = searchTerm.toLowerCase();

    return items.filter(item =>
      item.message?.toLowerCase().includes(searchTerm) ||
      item.statut?.toLowerCase().includes(searchTerm) ||
      new Date(item.date).toLocaleString('fr-FR').toLowerCase().includes(searchTerm)
    );
  }
  
}
