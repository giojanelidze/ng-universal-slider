import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomManipulatorComponent } from './dom-manipulator.component';

describe('DomManipulatorComponent', () => {
  let component: DomManipulatorComponent;
  let fixture: ComponentFixture<DomManipulatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomManipulatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomManipulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
