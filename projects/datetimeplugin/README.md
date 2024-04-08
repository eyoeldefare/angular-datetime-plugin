# Datetimeplugin

This is a time plugin for the datepicker material component from angular material. It allows you to integrate a time picker.

# Examples

``` javascript 
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
})

export class AppComponent {
  minDAte = new Date(2024, 1, 1, 9, 45)
  maxDAte = new Date(2025, 1, 1, 12, 54)
  startDate = new Date();
  readOnly = false;
}
```

``` html
    <mat-form-field>
        <mat-label>Choose a date</mat-label>
        <input [min]="minDAte" [max]="maxDAte" matInput [matDatepicker]="picker1">
        <mat-hint>MM/DD/YYYY</mat-hint>
        <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
        <mat-datepicker #picker1></mat-datepicker>

        <ngx-datetime-plugin 
          (pickedDate)="onDateTimePick($event)"
          [inputsReadOnly]="readOnly" 
          [minLocalDatetime]="minDAte" 
          [maxLocalDatetime]="maxDAte" 
          [for]="picker1">
        </ngx-datetime-plugin>

    </mat-form-field>
```

## Usage

To use this plugin, simply follow the example above. If you've provided a min, max, and start date for the datepicker instance, you also must give the same values for the datetimepickerplugin instance as well to stay consistent with the datepicker instance. 

You can also change the locale, and the format you want the datetime to display using the `TIME_FORMAT, MAT_DATE_LOCALE, DATE_FORMAT`. 

Note that the timer button uses the theme provided for the `<mat-datepicker/>` instance. 

## Sample visual examples

Visual examples with different locals

<img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_1.png" width=250> <img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_2.png" width=250> <img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_3.png" width=250> <img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_4.png" width=250> <img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_5.png" width=250> <img src="https://raw.githubusercontent.com/eyoeldefare/angular-datetime-plugin/main/src/assets/screen_6.png" width=250>