import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgUnSliderComponent } from './ng-un-slider.component';

describe('NgUnSliderComponent', () => {
  let component: NgUnSliderComponent;
  let fixture: ComponentFixture<NgUnSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgUnSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgUnSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
