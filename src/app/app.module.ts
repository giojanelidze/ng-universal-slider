import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgUnSliderModule } from 'projects/ng-un-slider/src/public_api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgUnSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
