import { Pipe, PipeTransform } from '@angular/core';
import { BookStatus } from '../../core/models/domain.models';
import { BOOK_STATUS_LABELS } from '../constants/library.constants';

@Pipe({
  name: 'bookStatusLabel'
})
export class BookStatusLabelPipe implements PipeTransform {
  transform(value: BookStatus): string {
    return BOOK_STATUS_LABELS[value];
  }
}
