import { Pipe, PipeTransform } from '@angular/core';
import { AmzLink } from '../models/types';

@Pipe({
    name: 'heartRateFilter',
    pure: false
})
export class HeartRateFilterPipe implements PipeTransform {
    transform(items: AmzLink[]): any {
        if (!items) {
            return items;
        }
        return items.filter(item => item.heartrate);
    }
}