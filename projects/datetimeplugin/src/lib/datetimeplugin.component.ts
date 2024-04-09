import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Inject, InjectionToken, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { CdkMenuModule } from '@angular/cdk/menu';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Clock, DATE_FORMAT, DateTimeService, DayPeriods, Hours, Minutes, TIMER_POSSITION_TOKEN, TIME_FORMAT, Time, TimeError, dateFormat, timeFormat, timerDropDownPossition } from './datetimeplugin.service';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ngx-datetime-plugin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, ReactiveFormsModule, CdkListbox, CdkOption, CdkMenuModule, MatNativeDateModule],
  providers: [
    { provide: TIMER_POSSITION_TOKEN, useValue: timerDropDownPossition },
    { provide: TIME_FORMAT, useValue: timeFormat },
    { provide: DATE_FORMAT, useValue: dateFormat },
    DateTimeService,
  ],
  template: `
  <style>
    .ngx-timepicker-form {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 1rem 0 2rem 0;
    } 

    .ngx-timepicker-form>div {
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .ngx-timepicker-input {
        width: 2.25rem;
        height: 2.25rem;
        border: 1px solid rgba(0, 0, 0, 0.54);
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.87);
        font-weight: 500;
        margin: 0 0.3125rem;
        padding: 0;
        border-radius: 0.1875rem;
        outline: none;
        text-align: center;
    }

    .ngx-timepicker-button {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.1875rem;
    }

    .ngx-timepicker>span {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.54);
    }

    .ngx-timepicker-ul {
      max-height: 12rem;
      list-style-type: none; 
      padding: 0;
      margin: 0;
      border: 1px solid rgba(0, 0, 0, 0.54);
      font-size: 0.8125rem;
      color: rgba(0, 0, 0, 0.87);
      font-weight: 400;
      border-radius: 0.1875rem;
      width: 2.25rem;
      overflow-y: scroll;
      overflow-x: hidden;
      text-align: center;
      outline: none;
    } 

    .ngx-timepicker-ul::-webkit-scrollbar {
        width: 0.25rem;
        border-radius: .5rem;
    }

    .ngx-timepicker-ul::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.30);
        border-radius: .5rem;
        border: 1px solid transparent;
    }

    .ngx-timepicker-ul::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.45);
    }

    .ngx-timepicker-li {
        background-color: #fff;
        padding: 0.125rem;
        cursor: pointer;
    }

    .ngx-timepicker-li:hover {
        font-weight: bold;
        text-decoration: underline;
    }

    .ngx-timepicker-li[role='menuitemradio'][aria-checked='true'] {
        font-weight: bold;
        text-decoration: underline;
    }

    .ngx-timepicker-li[role='menuitemradio'][aria-disabled='true'] {
        font-weight: normal;
        pointer-events: none;
    }
  </style>
  <ng-template>
    <form class="ngx-timepicker-form" [formGroup]="form!" (ngSubmit)="pickDate()">
        <div>
            @for (time of clock | keyvalue:compFn; track time.value.value) {
            @if (time.value.type==='hour') {
            <div class="ngx-timepicker">
                <input [readOnly]="inputsReadOnly" class="ngx-timepicker-input" 
                    #hourInput type="text" formControlName="hour" 
                    [name]="hourInput" [cdkMenuTriggerFor]="hourMenu"
                    [cdkMenuPosition]="timePossition" 
                    (blur)="onHourBlur($event, hourInput)"
                    (click)="onHourClicked($event, hourInput)">
                <ng-template #hourMenu>
                    <ul class="ngx-timepicker-ul" cdkMenu>
                        @for (hour of hours?.values | keyvalue:compFn; track hour.value.value) {
                        <li 
                            class="ngx-timepicker-li" 
                            cdkMenuItemRadio
                            [cdkMenuItemDisabled]="hour.value.disabled===true"
                            [cdkMenuItemChecked]="hour.value.value==hourInput.value && hour.value.disabled===false"
                            (cdkMenuItemTriggered)="onHourSelected(hour.value)">
                            {{hour.value.value}}
                        </li>
                        }
                    </ul>
                </ng-template>
            </div>
            }
            @else if (time.value.type==='minute') {
            <div class="ngx-timepicker">
                <input [readOnly]="inputsReadOnly" class="ngx-timepicker-input" #minuteInput type="text" formControlName="minute" [name]="minuteInput"
                    [cdkMenuTriggerFor]="minuteMenu" [cdkMenuPosition]="timePossition"
                    (blur)="onMinuteBlur($event, minuteInput)" 
                    (click)="onMinuteClicked($event, minuteInput)">
                <ng-template #minuteMenu>
                    <ul class="ngx-timepicker-ul" cdkMenu>
                        @for (minute of minutes?.values | keyvalue:compFn; track minute.value.value) {
                        <li class="ngx-timepicker-li" 
                            cdkMenuItemRadio 
                            [cdkMenuItemDisabled]="minute.value.disabled===true"
                            [cdkMenuItemChecked]="minute.value.value==minuteInput.value"
                            (cdkMenuItemTriggered)="onMinuteSelected(minute.value)">
                            {{minute.value.value}}
                        </li>
                        }
                    </ul>
                </ng-template>
            </div>
            }
            @else if (time.value.type==='dayPeriod') {
            <div class="ngx-timepicker">
                <input [readOnly]="inputsReadOnly" class="ngx-timepicker-input" #dayPeriodInput type="text" formControlName="dayPeriod" [name]="dayPeriodInput"
                    [cdkMenuPosition]="timePossition" [cdkMenuTriggerFor]="dayPeriodMenu"
                    (blur)="onDayPeriodBlur($event, dayPeriodInput)" 
                    (click)="onDayPeriodClicked($event, dayPeriodInput)">
                <ng-template #dayPeriodMenu>
                    <ul class="ngx-timepicker-ul" cdkMenu>
                        @for (dayPeriod of dayPeriods?.values | keyvalue:compFn; track dayPeriod.value.value) {
                        <li class="ngx-timepicker-li" 
                            cdkMenuItemRadio 
                            [cdkMenuItemDisabled]="dayPeriod.value.disabled===true"
                            [cdkMenuItemChecked]="dayPeriod.value.value==dayPeriodInput.value"
                            (cdkMenuItemTriggered)="onDayPeriodSelect(dayPeriod.value);">
                            {{dayPeriod.value.value}}
                        </li>
                        }
                    </ul>
                </ng-template>
            </div>
            }
            @else if (time.value.type==='literal') {
            <div class="ngx-timepicker">
                <span>{{time.value.value}}</span>
            </div>
            }
            }
        </div>
        <div>
            <button 
                class="ngx-timepicker-button" 
                type="submit" 
                mat-raised-button 
                [color]="themePalette">
                OK
            </button>
        </div>
    </form>
  </ng-template> 
  `,
})
export class DatetimepluginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(TemplateRef) private _template!: TemplateRef<any>;
  private _portal?: TemplatePortal;
  private _inputRef?: any;
  private _unsubInputStream?: Subscription;

  public form?: FormGroup;
  public calanderDate?: Date;
  public clock?: Clock;

  public hours?: Hours;
  public minutes?: Minutes;
  public dayPeriods?: DayPeriods;

  @Input()
  public inputsReadOnly!: boolean;

  @Output()
  public pickedDate!: EventEmitter<Date>;

  @Input({ required: true, alias: 'for' })
  get datePicker(): MatDatepicker<Date> {
    return this._datePicker;
  }
  set datePicker(picker: any) {
    if (!(picker instanceof MatDatepicker)) {
      throw new TimeError('missing-datepicker', 'Missing datepicker instance', 'error');
    } else if (picker.touchUi) {
      throw new TimeError('touch-ui-true', 'ngx-datetime-plugin doesn\'t go well with touchui dialog as it has experienced unpredictable resizing issues', 'error');
    } else {
      this._datePicker = picker;
    }
  }
  private _datePicker!: MatDatepicker<Date>;

  @Input({ required: false })
  get startLocalDatetime(): Date {
    return this._startLocalDatetime;
  }
  set startLocalDatetime(date: any) {
    if (this._timeManager.isValidDate(date)) {
      const startD = date as Date;
      this._startLocalDatetime = startD;
    } else {
      throw new TimeError('invalid-start-local-datetime', 'The starting datetime is not a valid date instance', 'error');
    }
  }
  private _startLocalDatetime!: Date;

  @Input()
  get maxLocalDatetime(): Date | undefined {
    return this._maxLocalDatetime;
  }
  set maxLocalDatetime(date: any) {
    if (this._timeManager.isValidDate(date)) {
      const startD = date as Date;
      this._maxLocalDatetime = startD;
    } else {
      throw new TimeError('invalid-max-local-datetime', 'The max datetime is not a valid date instance', 'error');
    }
  }
  private _maxLocalDatetime?: Date;

  @Input()
  get minLocalDatetime(): Date | undefined {
    return this._minLocalDatetime;
  }
  set minLocalDatetime(date: any) {
    if (this._timeManager.isValidDate(date)) {
      const startD = date as Date;
      this._minLocalDatetime = startD;
    } else {
      throw new TimeError('invalid-min-local-datetime', 'The min datetime is not a valid date instance', 'error');
    }
  }
  private _minLocalDatetime?: Date;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _timeManager: DateTimeService,
    @Inject(TIMER_POSSITION_TOKEN) public timePossition: ConnectedPosition[],
  ) {
    this.inputsReadOnly = false;
    this.pickedDate = new EventEmitter<Date>();
  }

  ngOnInit(): void {
    const initDateTime = this._timeManager.initDateTime(this._startLocalDatetime, this._minLocalDatetime, this._maxLocalDatetime);
    //Validate
    this._validateInputs();

    // Fetch start datetime
    this.clock = this._timeManager.initClock(initDateTime);
    this.hours = this._timeManager.initHours(initDateTime);
    this.minutes = this._timeManager.initMinutes(initDateTime);
    this.dayPeriods = this._timeManager.initDayPeriods(initDateTime);
    this._datePicker.select(initDateTime);

    this.form = new FormGroup({
      hour: new FormControl<string>(this.clock.get('hour')!.value),
      minute: new FormControl<string>(this.clock.get('minute')!.value),
      dayPeriod: new FormControl<string | undefined>(this.clock.get('dayPeriod')?.value),
    });
  }
  ngAfterViewInit(): void {
    this._portal = new TemplatePortal(this._template, this._viewContainerRef);
    this._datePicker.registerActions(this._portal);
    const dateInput = this._datePicker.datepickerInput as MatDatepickerInput<any>;
    this._unsubInputStream = dateInput.dateChange.asObservable().subscribe(value => {
      //Assuming its already been validated
      this.calanderDate = new Date(value.value);
      this._inputRef = value.targetElement;
    });
  }
  ngOnDestroy(): void {
    this._unsubInputStream?.unsubscribe();
    if (this._portal && this._portal.isAttached) {
      this._datePicker.removeActions(this._portal);
      this._portal.detach();
    }
  }

  //VALIDATE INPUTS
  private _validateInputs(): void {
    if (this._minLocalDatetime) {
      const dateMinDate = this.datePicker._getMinDate();
      console.log()
      if (
        !(dateMinDate &&
          this._minLocalDatetime.getFullYear() === dateMinDate.getFullYear() &&
          this._minLocalDatetime.getMonth() === dateMinDate.getMonth() &&
          this._minLocalDatetime.getDate() === dateMinDate.getDate())
      ) {
        throw new TimeError('none-matching-dates', 'Min datetime date doesn\'t match the datepicker min date', 'error');
      }
      else if (this._maxLocalDatetime && this._maxLocalDatetime.getTime() <= this._minLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Min datetime shouldn\'t be the same or more than the max datetime', 'error');
      }
      else if (this._startLocalDatetime && this._startLocalDatetime.getTime() < this._minLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Min datetime shouldn\'t be more than the start datetime', 'error');
      }
    }
    if (this._maxLocalDatetime) {
      const dateMaxDate = this.datePicker._getMaxDate();
      if (
        !(dateMaxDate &&
          this._maxLocalDatetime.getFullYear() === dateMaxDate.getFullYear() &&
          this._maxLocalDatetime.getMonth() === dateMaxDate.getMonth() &&
          this._maxLocalDatetime.getDate() === dateMaxDate.getDate())
      ) {
        throw new TimeError('none-matching-dates', 'Max datetime date doesn\'t match the datepicker max date', 'error');
      }
      else if (this._minLocalDatetime && this._minLocalDatetime.getTime() >= this._maxLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Max datetime shouldn\'t be the same or less than the min datetime', 'error');
      } else if (this._startLocalDatetime && this._startLocalDatetime.getTime() > this._maxLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Max datetime shouldn\'t be less than the start datetime', 'error');
      }
    }
    if (this._startLocalDatetime) {
      const dateStartDate = this.datePicker.startAt;
      if (
        !(dateStartDate &&
          this._startLocalDatetime.getFullYear() === dateStartDate.getFullYear() &&
          this._startLocalDatetime.getMonth() === dateStartDate.getMonth() &&
          this._startLocalDatetime.getDate() === dateStartDate.getDate())
      ) {
        throw new TimeError('none-matching-dates', 'Start datetime date doesn\'t match the datepicker start date', 'error');
      }
      else if (this._minLocalDatetime && this._minLocalDatetime.getTime() > this._startLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Start datetime shouldn\'t be less than the min datetime', 'error');
      } else if (this._maxLocalDatetime && this._maxLocalDatetime.getTime() < this._startLocalDatetime.getTime()) {
        throw new TimeError('out-of-bound-date', 'Start datetime shouldn\'t be more than the max datetime', 'error');
      }
    }
  }

  public onHourClicked(_: MouseEvent, element: HTMLInputElement) {
    this._datePicker._applyPendingSelection();
    const hour = Number(this.hours?.values.get(this.form?.get('hour')?.value)?.valueEn);
    const minute = Number(this.minutes?.values.get(this.form?.get('minute')?.value)?.valueEn);
    const dayPeriodEn = this.dayPeriods?.values.get(this.form?.get('dayPeriod')?.value)?.valueEn as string | undefined;

    if (!isNaN(hour) && !isNaN(minute) && this.calanderDate) {
      const hours = this._timeManager.fetchHours(this.calanderDate, minute, dayPeriodEn, this._minLocalDatetime, this._maxLocalDatetime);
      this.hours!.values = hours.values;
      this.hours!.maxValue = hours.maxValue;
      this.hours!.minValue = hours.minValue;
      const showHour = this._timeManager.showHour(hour, dayPeriodEn);
      const date = new Date(
        this.calanderDate!.getFullYear(),
        this.calanderDate!.getMonth(),
        this.calanderDate?.getDate(),
        showHour,
        minute,
      );
      const showDate = this._timeManager.showDate(date);
      this._inputRef!.value = showDate;
    }
    element.focus();
  }

  public onHourSelected(selectedHour: Time) {
    if (!selectedHour.disabled) {
      this.form?.get('hour')?.setValue(selectedHour.value);
    }
  }


  public onHourBlur(_: FocusEvent, element: HTMLInputElement) {
    const maxLength = this.hours!.maxLength;
    const minLength = this.hours!.minLength;

    const minValue = this.hours!.minValue;
    const maxValue = this.hours!.maxValue;

    const minValueEn = this._timeManager.is12Hour ? Number(this.hours?.values.get(this.hours!.minValue)?.valueEn) % 12 : Number(this.hours?.values.get(this.hours!.minValue)?.valueEn);
    const maxValueEn = this._timeManager.is12Hour ? Number(this.hours?.values.get(this.hours!.maxValue)?.valueEn) % 12 : Number(this.hours?.values.get(this.hours!.maxValue)?.valueEn);
    const elementNumVal = Number(element.value);
    const elementNumValEn = Number(this.hours!.values.get(element.value)?.valueEn);

    const value = this._timeManager.is12Hour ? elementNumVal === 12 ? 0 : elementNumVal : elementNumVal;
    const valueEn = this._timeManager.is12Hour ? elementNumValEn === 12 ? 0 : elementNumValEn : elementNumValEn;

    const twelve = this.hours!.twelve;

    if (element.value.length > maxLength!) {
      this.form?.get('hour')?.setValue(maxValue);
    } else if (element.value.length < minLength!) {
      this.form?.get('hour')?.setValue(minValue);
    } else if (isNaN(valueEn) && isNaN(value)) {
      this.form?.get('hour')?.setValue(minValue);
    } else if (!isNaN(value) && value < minValueEn) {
      this.form?.get('hour')?.setValue(minValue);
    } else if (!isNaN(value) && value > maxValueEn) {
      this.form?.get('hour')?.setValue(maxValue);
    } else if (this._timeManager.is12Hour && (value === 0 || valueEn === 0)) {
      this.form?.get('hour')?.setValue(twelve);
    } else if (!isNaN(valueEn) && valueEn < minValueEn) {
      this.form?.get('hour')?.setValue(minValue);
    } else if (!isNaN(valueEn) && valueEn > maxValueEn) {
      this.form?.get('hour')?.setValue(maxValue);
    }
  }

  public onMinuteClicked(_: MouseEvent, element: HTMLInputElement) {
    this._datePicker._applyPendingSelection();
    const hour = Number(this.hours?.values.get(this.form?.get('hour')?.value)?.valueEn);
    const minute = Number(this.minutes?.values.get(this.form?.get('minute')?.value)?.valueEn);
    const dayPeriodEng = this.dayPeriods?.values.get(this.form?.get('dayPeriod')?.value)?.valueEn as string | undefined;

    if (!isNaN(hour) && this.calanderDate) {
      const minutes = this._timeManager.fetchMinutes(this.calanderDate!, hour, dayPeriodEng, this._minLocalDatetime, this._maxLocalDatetime);
      this.minutes!.minValue = minutes.minValue;
      this.minutes!.maxValue = minutes.maxValue;
      this.minutes!.values = minutes.values;
      const showHour = this._timeManager.showHour(hour, dayPeriodEng);
      const date = new Date(
        this.calanderDate!.getFullYear(),
        this.calanderDate!.getMonth(),
        this.calanderDate?.getDate(),
        showHour,
        minute,
      );
      const showDate = this._timeManager.showDate(date);
      this._inputRef!.value = showDate;
    }
    element.focus();
  }

  public onMinuteSelected(minute: Time) {
    if (!minute.disabled) {
      this.form?.get('minute')?.setValue(minute.value);
    }
  }

  public onMinuteBlur(_: FocusEvent, element: HTMLInputElement) {
    const maxLength = this.minutes!.maxLength;
    const minLength = this.minutes!.minLength;

    const minValue = this.minutes!.minValue;
    const maxValue = this.minutes!.maxValue;

    const minValueEn = Number(this.minutes?.values.get(this.minutes!.minValue)?.valueEn);
    const maxValueEn = Number(this.minutes?.values.get(this.minutes!.maxValue)?.valueEn);

    const value = Number(element.value);
    const valueEn = Number(this.minutes!.values.get(element.value)?.valueEn);

    if (element.value.length > maxLength!) {
      this.form?.get('minute')?.setValue(maxValue);
    } else if (element.value.length < minLength!) {
      this.form?.get('minute')?.setValue(minValue);
    } else if (isNaN(valueEn) && isNaN(value)) {
      this.form?.get('minute')?.setValue(minValue);
    } else if (!isNaN(value) && value < minValueEn) {
      this.form?.get('minute')?.setValue(minValue);
    } else if (!isNaN(value) && value > maxValueEn) {
      this.form?.get('minute')?.setValue(maxValue);
    } else if (!isNaN(valueEn) && valueEn < minValueEn) {
      this.form?.get('minute')?.setValue(minValue);
    } else if (!isNaN(valueEn) && valueEn > maxValueEn) {
      this.form?.get('minute')?.setValue(maxValue);
    }
  }

  public onDayPeriodClicked(_: MouseEvent, element: HTMLInputElement) {
    this._datePicker._applyPendingSelection();
    const hour = Number(this.hours?.values.get(this.form?.get('hour')?.value)?.valueEn);
    const minute = Number(this.minutes?.values.get(this.form?.get('minute')?.value)?.valueEn);
    const dayPeriod = this.dayPeriods?.values.get(this.form?.get('dayPeriod')?.value)?.valueEn as string | undefined;

    if (!isNaN(hour) && !isNaN(minute) && this.calanderDate) {
      const dayPeriods = this._timeManager.fetchDayPeriods(this.calanderDate, hour, minute, this._minLocalDatetime, this._maxLocalDatetime);
      this.dayPeriods!.values = dayPeriods.values;
      const showHour = this._timeManager.showHour(hour, dayPeriod);
      const date = new Date(
        this.calanderDate!.getFullYear(),
        this.calanderDate!.getMonth(),
        this.calanderDate?.getDate(),
        showHour,
        minute,
      );
      const showDate = this._timeManager.showDate(date);
      this._inputRef!.value = showDate;
    }
    element.focus();
  }

  public onDayPeriodSelect(dayPeriod: Time) {
    if (!dayPeriod.disabled) {
      this.form?.get('dayPeriod')?.setValue(dayPeriod.value);
    }
  }

  public onDayPeriodBlur(_: FocusEvent, element: HTMLInputElement) {
    const maxLength = this.dayPeriods!.maxLength;
    const minLength = this.dayPeriods!.minLength;

    const minValue = this.dayPeriods!.minValue;
    const maxValue = this.dayPeriods!.maxValue;

    const value = element.value;

    if (element.value.length > maxLength!) {
      this.form?.get('dayPeriod')?.setValue(maxValue);
    }
    else if (element.value.length < minLength!) {
      this.form?.get('dayPeriod')?.setValue(minValue);
    }
    else if (value != minValue && value != maxValue) {
      this.form?.get('dayPeriod')?.setValue(minValue);
    }
  }

  public get themePalette(): ThemePalette {
    return this._datePicker.color;
  }

  public pickDate() {
    //Validate and send the date to user
    const minT = this._minLocalDatetime?.getTime();
    const maxT = this._maxLocalDatetime?.getTime();

    const nativeHour = Number(this.form?.get('hour')?.value);
    const nativeMinute = Number(this.form?.get('minute')?.value);
    const nativeDayPeriod = this.form?.get('dayPeriod')?.value;

    if (!isNaN(nativeHour) && !isNaN(nativeMinute) && this.calanderDate && (!nativeDayPeriod || nativeDayPeriod === 'AM' || nativeDayPeriod === 'PM')) {
      this._datePicker._applyPendingSelection();
      //Validate the date further (check its validate date, and within min and max)
      const hour24 = this._timeManager.showHour(nativeHour, nativeDayPeriod);
      const date = new Date(
        this.calanderDate.getFullYear(),
        this.calanderDate.getMonth(),
        this.calanderDate.getDate(),
        hour24,
        nativeMinute,
      );
      const dateT = date.getTime();
      if (
        this._timeManager.isValidDate(date) &&
        (!minT || (minT && minT <= dateT)) &&
        ((maxT && maxT >= dateT) || !maxT)
      ) {
        this.pickedDate.emit(date);
        const showDate = this._timeManager.showDate(date);
        this._inputRef!.value = showDate;
        this.datePicker?.close();
      }
      else if (!this._timeManager.isValidDate(date)) {
        throw new TimeError('invalid-date', 'The date selected is an invalid date', 'error');
      }
      else if (!(!minT || (minT && minT <= dateT))) {
        throw new TimeError('out-of-bound-date', 'The date selected is less than the min datetime', 'error');
      }
      else if (!((maxT && maxT >= dateT) || !maxT)) {
        throw new TimeError('out-of-bound-date', 'The date selected is more than the max datetime', 'error');
      }
    } else {
      const hourEn = this.hours?.values.get(this.form?.get('hour')?.value)?.valueEn as number | undefined;
      const minuteEn = this.minutes?.values.get(this.form?.get('minute')?.value)?.valueEn as number | undefined;
      const dayPeriodEn = this.dayPeriods?.values.get(nativeDayPeriod)?.valueEn as string | undefined;

      if (hourEn != undefined && !isNaN(hourEn) && minuteEn != undefined && !isNaN(minuteEn) && (!nativeDayPeriod || dayPeriodEn === 'AM' || dayPeriodEn === 'PM')) {
        this._datePicker._applyPendingSelection();
        //Validate the date
        const hour24 = this._timeManager.showHour(hourEn, dayPeriodEn);
        const date = new Date(
          this.calanderDate!.getFullYear(),
          this.calanderDate!.getMonth(),
          this.calanderDate?.getDate(),
          hour24,
          minuteEn,
        );
        const dateT = date.getTime();
        if (
          this._timeManager.isValidDate(date) &&
          (!minT || (minT && minT <= dateT)) &&
          ((maxT && maxT >= dateT) || !maxT)
        ) {
          this.pickedDate.emit(date);
          const showDate = this._timeManager.showDate(date);
          this._inputRef!.value = showDate;
          this.datePicker?.close();
        }
        else if (!this._timeManager.isValidDate(date)) {
          throw new TimeError('invalid-date', 'The date selected is an invalid date', 'error');
        }
        else if (!(!minT || (minT && minT <= dateT))) {
          throw new TimeError('out-of-bound-date', 'The date selected is less than the min datetime', 'error');
        }
        else if (!((maxT && maxT >= dateT) || !maxT)) {
          throw new TimeError('out-of-bound-date', 'The date selected is more than the max datetime', 'error');
        }
      }
    }
  }

  public compFn(a: any, b: any): any { return {} };
}
