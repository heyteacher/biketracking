import { formatNumber } from "@angular/common";
import * as moment from "moment"
import { localize } from "nativescript-localize/angular";


export function  formatNumberValue(value: number, digitsInfo: string = '1.1-1'): string {
    value = value ? value : 0
    return formatNumber(value, 'en', digitsInfo)
}

export function formatDurationValue(value) {
    return value ? moment.utc(value).format("HH:mm") : "00:00"
}

export function formatTimeValue(value) {
    return value ? moment(value).format("HH:mm") : "00:00"
}

export function formatDateValue(value) {
    return value ? moment(value).format("DD/MM/YYYY") : "-"
}

export function formatDateTimeValue(value) {
    return value ? moment(value).format("DD/MM/YYYY HH:mm") : "-"
}

export function humanizeTime(time: moment.Moment = moment()): string {
    let timeMinutes = time.format('mm');
    if (timeMinutes == '00') {
        timeMinutes = localize("o'clock");
    }
    return `${time.format('H')} ${timeMinutes} ${time.format('a')}`
}


export function humanizeDuration(duration: moment.Duration): string {
    let hours = '';
    let minutes = '';
    let days = '';

    if (duration.days() == 1) {
        days = localize('one day');
    }
    else if (duration.days() > 1) {
        days = localize('%s days',`${duration.asDays()}`)
    }

    if (duration.hours() == 1) {
        hours = localize('one hour');
    }
    else if (duration.hours() > 1) {
        hours = localize('%s hours', `${duration.hours()}`)
    }
    
    if (duration.minutes() == 1) {
        minutes = localize('one minute')
    }
    else if (duration.minutes() > 1) {
        minutes = localize('%s minutes', `${duration.minutes()}`)
    }
    
    return `${days} ${hours} ${minutes}`
}
