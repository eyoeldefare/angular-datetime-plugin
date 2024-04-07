import { Component } from '@angular/core';
import { DatetimepluginComponent, TIME_FORMAT, DATE_FORMAT } from "datetimeplugin";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatInputModule, MatNativeDateModule, MatDatepickerModule, DatetimepluginComponent],
  providers: [
    //en-150, am-ET, fa, en-US, ko-KR	
    { provide: MAT_DATE_LOCALE, useValue: 'ko-KR' },
    {
      provide: TIME_FORMAT, useValue: {
        hour: '2-digit',
        minute: '2-digit',
      }
    },
    {
      provide: DATE_FORMAT, useValue: {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }
    },
  ],
  template: `
    <mat-form-field>
    <mat-label>Choose a date</mat-label>
    <input [min]="minDAte" [max]="maxDAte" matInput [matDatepicker]="picker1">
    <mat-hint>MM/DD/YYYY</mat-hint>
    <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
    <mat-datepicker #picker1></mat-datepicker>
    <ngx-datetime-plugin [inputsReadOnly]="readOnly" [minLocalDatetime]="minDAte" [maxLocalDatetime]="maxDAte" [for]="picker1"></ngx-datetime-plugin>
    </mat-form-field>
  `
})
export class AppComponent {
  minDAte = new Date(2024, 1, 1, 9, 45)
  maxDAte = new Date(2025, 1, 1, 12, 54)
  startDate = new Date();
  readOnly = false;
}
