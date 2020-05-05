import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgUnSliderComponent } from './ng-un-slider.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { DomManipulatorComponent } from './dom-manipulator/dom-manipulator.component';

@NgModule({
  declarations: [NgUnSliderComponent, DomManipulatorComponent],
  imports: [CommonModule, RouterModule, BrowserModule],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  exports: [NgUnSliderComponent]
})
export class NgUnSliderModule { }
