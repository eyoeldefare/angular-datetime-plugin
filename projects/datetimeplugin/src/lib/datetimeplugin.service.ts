import { ConnectedPosition } from "@angular/cdk/overlay";
import { Inject, Injectable, InjectionToken, Optional } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";

//Time Values
export interface Time {
    type: string;
    value: string;
    disabled: boolean;
    valueEn?: number | string;
}

export interface Hour extends Time {
    valueEn: number;
}

export interface Minute extends Time {
    valueEn: number;
}

export interface DayPeriod extends Time {
    valueEn: string;
}

export interface Literal extends Time { }

//Time Dropdown Values
export interface TimeDropdowns {
    maxLength?: number;
    minLength?: number;
    maxValue?: string;
    minValue?: string;
    is12Hour?: boolean;
    twelve?: string;
    values: Map<string, Time>;
}

export interface Hours extends TimeDropdowns {
    maxValue: string;
    minValue: string;
}

export interface Minutes extends TimeDropdowns {
    maxValue: string;
    minValue: string;
}

export interface DayPeriods extends TimeDropdowns { }

export type Clock = Map<string, Time>;


export const TIMER_POSSITION_TOKEN = new InjectionToken<ConnectedPosition[]>('TIMER_POSSITION_TOKEN');
export const TIME_FORMAT = new InjectionToken<any>('TIME_FORMAT_TOKEN');
export const DATE_FORMAT = new InjectionToken<any>('DATE_FORMAT_TOKEN');

export const timerDropDownPossition: ConnectedPosition[] = [{
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom'
},
{
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom'
},
{
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom'
}];

export const timeFormat: any = {
    hour: '2-digit',
    minute: '2-digit',
}

export const dateFormat: any = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
}

@Injectable()
export class DateTimeService {
    /**
    * @param _matLocal 
    * If no local is provided, en-US is used by default
    */
    private _is12Hour!: boolean;
    constructor(
        @Optional() @Inject(MAT_DATE_LOCALE) private _matLocal?: string,
        @Optional() @Inject(TIME_FORMAT) private _timeFormats?: any,
        @Optional() @Inject(DATE_FORMAT) private _dateFormats?: any,
        private _adapter?: DateAdapter<any>,
    ) {
        this._adapter?.setLocale(this._matLocal);
        this._is12Hour = this._initLocalHour(new Date(), this._matLocal);
    }

    public initDateTime(startDate?: Date, minDate?: Date, maxDate?: Date): Date {
        if (startDate) {
            return startDate;
        } else {
            const now = new Date();
            if (minDate && maxDate) {
                if (minDate.getTime() <= now.getTime() && maxDate.getTime() >= now.getTime()) {
                    return now;
                } else {
                    const diff = maxDate.getTime() - minDate.getTime();
                    const newMin = minDate.getTime() + diff / 2;
                    return new Date(newMin);
                }
            } else if (minDate && !maxDate) {
                if (minDate.getTime() <= now.getTime()) {
                    return now;
                }
                else {
                    return minDate;
                }
            } else if (!minDate && maxDate) {
                if (maxDate.getTime() >= now.getTime()) {
                    return now;
                }
                else {
                    return maxDate;
                }
            } else {
                return now;
            }
        }
    }

    public initTime(datetime: Date): Clock {
        const time: Map<string, Time> = new Map();
        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        dtf.formatToParts(datetime).forEach(ftp => {
            if (ftp.type === 'hour') {
                time.set(ftp.type, {
                    type: ftp.type,
                    value: ftp.value,
                    disabled: false,
                });
            } else if (ftp.type === 'minute') {
                time.set(ftp.type, {
                    type: ftp.type,
                    value: ftp.value,
                    disabled: false,
                });
            } else if (ftp.type === 'dayPeriod') {
                time.set(ftp.type, {
                    type: ftp.type,
                    value: ftp.value,
                    disabled: false,
                });
            } else if (ftp.type === 'literal') {
                time.set(ftp.type + '_' + ftp.value, {
                    type: ftp.type,
                    value: ftp.value,
                    disabled: false,
                });
            }
        });
        return time;
    }

    public showDate(datetime: Date) {
        const dtf = new Intl.DateTimeFormat(this._matLocal, {
            ...this._timeFormats, ...this._dateFormats
        });
        return dtf.format(datetime);
    }

    public initHours(datetime: Date): Hours {
        let minLength = 1;
        let maxLength = 1;
        let twelve;
        let minValue;
        let maxValue;
        let minValueSet = false;
        const hours = new Map<string, Hour>();
        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        const start = this._is12Hour ? 0 : 0;
        const end = this._is12Hour ? 12 : 24;
        for (let h = start; h < end; h++) {
            const date = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), h);
            dtf.formatToParts(date).forEach(ftp => {
                if (ftp.type === 'hour') {
                    if (!minValueSet) {
                        minValue = ftp.value;
                        twelve = ftp.value;
                        minValueSet = true;
                    }
                    maxValue = ftp.value;
                    minLength = ftp.value.length < minLength ? ftp.value.length : minLength;
                    maxLength = ftp.value.length > maxLength ? ftp.value.length : maxLength;
                    hours.set(ftp.value, { type: ftp.type, value: ftp.value, valueEn: h, disabled: false, });
                }
            });
        }
        return {
            twelve: twelve,
            maxValue: maxValue!,
            minValue: minValue!,
            is12Hour: this._is12Hour,
            minLength: minLength,
            maxLength: maxLength,
            values: hours,
        };
    }

    public initMinutes(datetime: Date): Minutes {
        let minLength = 1;
        let maxLength = 1;
        let minValue;
        let maxValue;
        let minValueSet = false;
        const minutes = new Map<string, Minute>();
        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        for (let m = 0; m < 60; m++) {
            const date = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), datetime.getHours(), m);
            dtf.formatToParts(date).forEach(ftp => {
                minLength = ftp.value.length < minLength ? ftp.value.length : minLength;
                maxLength = ftp.value.length > maxLength ? ftp.value.length : maxLength;
                if (ftp.type === 'minute') {
                    if (!minValueSet) {
                        minValue = ftp.value;
                        minValueSet = true;
                    }
                    maxValue = ftp.value;
                    minutes.set(ftp.value, { type: ftp.type, value: ftp.value, valueEn: m, disabled: false });
                }
            });
        }
        return {
            minValue: minValue!,
            maxValue: maxValue!,
            minLength: minLength,
            maxLength: maxLength,
            values: minutes,
        }
    }

    public initDayPeriods(datetime: Date): DayPeriods {
        const dayPeriods = new Map<string, DayPeriod>();
        let minLength = 1;
        let maxLength = 1;
        let minValue;
        let maxValue;
        let minValueSet = false;
        const hours = this._is12Hour ? [1, 13] : [];

        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        for (const dp of hours) {
            const cdwh = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), dp);
            dtf.formatToParts(cdwh).forEach(ftp => {
                minLength = ftp.value.length < minLength ? ftp.value.length : minLength;
                maxLength = ftp.value.length > maxLength ? ftp.value.length : maxLength;
                if (ftp.type === 'dayPeriod') {
                    if (!minValueSet) {
                        minValue = ftp.value;
                        minValueSet = true;
                    }
                    maxValue = ftp.value;
                    dayPeriods.set(ftp.value, { type: ftp.type, value: ftp.value, valueEn: dp === 1 ? 'AM' : 'PM', disabled: false });
                }
            });
        }
        return {
            minValue: minValue,
            maxValue: maxValue,
            minLength: minLength,
            maxLength: maxLength,
            values: dayPeriods,
        }
    }

    public fetchHours(date: Date, minute: number, dayePeriod?: string | null, minDate?: Date, maxDate?: Date): Hours {
        const hours = new Map<string, Hour>();
        const minT = minDate?.getTime();
        const maxT = maxDate?.getTime();
        const startHour = this._is12Hour ? dayePeriod === 'AM' ? 0 : 12 : 0;
        const endHour = this._is12Hour ? dayePeriod === 'AM' ? 12 : 24 : 24;
        let minValue;
        let maxValue;
        let minSet = false;
        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        for (let h = startHour; h < endHour; h++) {
            const enVal = this._is12Hour ? h % 12 || 12 : h;
            const cdwh = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, minute);
            const cdwht = cdwh.getTime();
            dtf.formatToParts(cdwh).forEach(ftp => {
                if (ftp.type === 'hour') {
                    if ((!minT || (minT && minT <= cdwht)) && ((maxT && maxT >= cdwht) || !maxT)) {
                        maxValue = ftp.value;
                        if (!minSet) {
                            minValue = ftp.value;
                            minSet = true;
                        }
                        hours.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: enVal,
                            disabled: false,
                        });
                    } else {
                        hours.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: enVal,
                            disabled: true,
                        });
                    }
                }
            });
        }
        return {
            minValue: minValue!,
            maxValue: maxValue!,
            values: hours,
        };
    }

    public fetchMinutes(date: Date, hour: number, enDayPeriod?: string, minDate?: Date, maxDate?: Date): Minutes {
        const minutes = new Map<string, Minute>();
        const minT = minDate?.getTime();
        const maxT = maxDate?.getTime();

        const startDayPeriod = enDayPeriod ?? 'AM';
        let minValue;
        let maxValue;
        let minSet = false;

        const start24Hour = this.showHour(hour, startDayPeriod);
        const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
        for (let m = 0; m < 60; m++) {
            const cdwhm = new Date(date.getFullYear(), date.getMonth(), date.getDate(), start24Hour, m);
            const cdwhmt = cdwhm.getTime();
            dtf.formatToParts(cdwhmt).forEach(ftp => {
                if (ftp.type === 'minute') {
                    if ((!minT || (minT && minT <= cdwhmt)) && ((maxT && maxT >= cdwhmt) || !maxT)) {
                        maxValue = ftp.value;
                        if (!minSet) {
                            minValue = ftp.value;
                            minSet = true;
                        }
                        minutes.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: m,
                            disabled: false,
                        });
                    } else {
                        minutes.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: m,
                            disabled: true,
                        });
                    }
                }
            });
        }
        return {
            minValue: minValue!,
            maxValue: maxValue!,
            values: minutes,
        };
    }

    public fetchDayPeriods(date: Date, hour: number, minute: number, minDate?: Date, maxDate?: Date): DayPeriods {
        const dayPeriods = new Map<string, DayPeriod>();
        const minT = minDate?.getTime();
        const maxT = maxDate?.getTime();
        if (hour <= 12) {
            const dtf = new Intl.DateTimeFormat(this._matLocal, { ...this._timeFormats });
            const amHour = hour === 12 ? 0 : hour;
            const pmHour = hour === 12 ? 12 : hour + 12;
            const amDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), amHour, minute);
            const pmDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), pmHour, minute);
            const amDateT = amDate.getTime();
            const pmDateT = pmDate.getTime();
            dtf.formatToParts(amDateT).forEach(ftp => {
                if (ftp.type === 'dayPeriod') {
                    if ((!minT || (minT && minT <= amDateT)) && ((maxT && maxT >= amDateT) || !maxT)) {
                        dayPeriods.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: 'AM',
                            disabled: false,
                        });
                    } else {
                        dayPeriods.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: 'AM',
                            disabled: true,
                        });
                    }
                }
            });
            dtf.formatToParts(pmDateT).forEach(ftp => {
                if (ftp.type === 'dayPeriod') {
                    if ((!minT || (minT && minT <= pmDateT)) && ((maxT && maxT >= pmDateT) || !maxT)) {
                        dayPeriods.set(ftp.value, {
                            type: ftp.type,
                            value: ftp.value,
                            valueEn: 'PM',
                            disabled: false,
                        });
                    } else {
                        dayPeriods.set(ftp.value, {
                            type: ftp.type,

                            value: ftp.value,
                            valueEn: 'PM',
                            disabled: true,
                        });
                    }
                }
            });
        }
        return {
            values: dayPeriods
        };
    }

    public isValidDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    public showHour(hour: number, enDayPeriod?: string) {
        return this._is12Hour ? this._convert12To24(enDayPeriod!, hour) : hour;
    }

    private _initLocalHour(date: Date, local: string | undefined): boolean {
        const dtf = new Intl.DateTimeFormat(local, { ...this._timeFormats });
        return dtf.formatToParts(date).find(d => d.type === 'dayPeriod') !== undefined;
    }
    
    private _convert12To24(enDayPeriod: string, hour: number): number {
        if (enDayPeriod === "PM" && hour !== 12) {
            hour = 12 + hour;
        } else if (enDayPeriod === 'AM' && hour === 12) {
            hour = 0;
        }
        return hour;
    }
    public get is12Hour() {
        return this._is12Hour;
    }
}

export class TimeError extends Error { 
    constructor(type: string, message: string, errorCode?: string, details?: any) {
        const ec = errorCode ? 'error' : errorCode;
        super(`${ec}/${type}: ${message} ${details?' ====> '+JSON.stringify(details):''}`);
    }
}