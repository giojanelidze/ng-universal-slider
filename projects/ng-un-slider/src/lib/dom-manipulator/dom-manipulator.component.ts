import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID, Renderer2, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SliderConfigType } from '../ng-un-slider.interface';
import { Slider } from '../slider';
import { deepMerge } from '../merge';

@Component({
  template: ''
})
export class DomManipulatorComponent implements OnInit {
  @Input()
  public set config(v: SliderConfigType) {
    deepMerge(this.slider.sliderConfig, v);
    if (this.slider.sliderConfig.margin && this.slider.sliderConfig.margin.position === 'none'
      && this.slider.sliderConfig.margin.size) {
      this.slider.sliderConfig.margin.size = 0;
    }
  }
  public get config(): SliderConfigType {
    return this.slider.sliderConfig;
  }
  @ViewChild('sliderContainer', { static: true }) _sliderContainer: ElementRef;
  private _sliderContainerChilds: ElementRef[];
  public get sliderContainerChilds(): ElementRef[] {
    if (!this._sliderContainerChilds) {
      this._sliderContainerChilds = this._sliderContainer && this._sliderContainer.nativeElement
        ? this._sliderContainer.nativeElement.children
        : [];
    }
    return this._sliderContainerChilds;
  }
  // private get sliderConteinersDivCount(): Array<number> {
  //   const countArray = [];
  //   if (this.isBrowser) {
  //     const count = this.elementLength && this.dataSource.length
  //       ? Math.ceil(this.dataSource.length / this.config.cellCount) + 2
  //       : 0;
  //     for (let index = 0; index < count; index++) {
  //       countArray.push(index);
  //     }
  //   }
  //   return countArray;
  // }

  public showSlider: boolean;
  public sliderContainerWidth = 0;
  public elementLength = 0;

  protected previousIndex = 0;
  protected childDivsWidth = 0;
  protected slider: Slider = new Slider();
  protected remains: number;
  protected isBrowser: boolean;
  protected get clientWidth(): number {
    return this.el && this.el.nativeElement ? (this.el.nativeElement as Element).clientWidth : 0;
  }
  protected dividedBlokCount: number; // itemDivCount

  constructor(
    @Inject(PLATFORM_ID) public platformId: string,
    public renderer: Renderer2,
    public el: ElementRef
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngOnInit() {
  }

  protected resetConfiguration() {
    this.remains = 0;
    this._sliderContainerChilds = undefined;
    this.dividedBlokCount = undefined;
    this.sliderContainerWidth = 0;
  }

  protected removeDivContainers() {
    while (this.sliderContainerChilds.length) {
      if (this.sliderContainerChilds.hasOwnProperty(0)) {
        const element = this.sliderContainerChilds[0];
        this.renderer.removeChild(this._sliderContainer.nativeElement, element);
      }
    }
  }

  protected createDivContainers() {
    if (this.isBrowser) {
      if (!this.dividedBlokCount) {
        this.dividedBlokCount = this.getDividedBlokCount();
      }
      for (let divIndex = 0; divIndex < this.dividedBlokCount; divIndex++) {
        const div = this.getDivElement();
        this.renderer.appendChild(this._sliderContainer.nativeElement, div);
        for (let cellIndex = 0; cellIndex < this.config.cellCount; cellIndex++) {
          if (divIndex === 0 && this.remains > 0 && cellIndex >= this.remains) { continue; }
          const existingItemsCount = this.sliderContainerChilds.length - (divIndex + 1);
          if (this.remains > 0 && existingItemsCount === this.config.cellCount
            && divIndex !== this.dividedBlokCount - 1) { break; }
          if (existingItemsCount > 0) { this.renderer.appendChild(div, this.sliderContainerChilds[0]); }
        }
        if (div.children.length < this.config.cellCount) {
          const width = this.clientWidth - (this.config.margin
            ? this.config.margin.position === 'both' ? this.config.margin.size * 2 : this.config.margin.size
            : 0);
          this.childDivsWidth = width * (div.children.length / this.config.cellCount);
          div.style.width = `${this.childDivsWidth}px`;
        }
        this.sliderContainerWidth += Number(String(div.style.width).replace('px', ''));
      }
      this.showSlider = true;
    }
  }

  protected getDivElement() {
    const div = this.renderer.createElement('div');
    div.className = this.slider.sliderConfig.containerClass.priority === 'concat'
      ? `_cs_slider__container__item ${this.slider.sliderConfig.containerClass.class}`
      : this.slider.sliderConfig.containerClass.class;
    this.childDivsWidth = this.clientWidth - (this.config.margin
      ? this.config.margin.position === 'both' ? this.config.margin.size * 2 : this.config.margin.size
      : 0);
    div.style.width = `${this.childDivsWidth}px`;
    return div;
  }

  protected resizeDivs(index: number, up: boolean) {
    const lastIndex = (index + (up ? -1 : 1)) < 0
      || (index + (up ? -1 : 1)) === this.sliderContainerChilds.length
      ? 0
      : (index + (up ? -1 : 1));
    if (!this.sliderContainerChilds[index] || !this.sliderContainerChilds[lastIndex]) { return; }
    // TODO: Move in to method
    if (index === 1) {
      this.renderer.removeClass(this.sliderContainerChilds[this.sliderContainerChilds.length - 1], 'active');
    } else {
      if (lastIndex === this.sliderContainerChilds.length - 1) {
        this.renderer.removeClass(this.sliderContainerChilds[0], 'active');
      }
    }
    if (this.sliderContainerChilds[this.previousIndex]) {
      this.renderer.removeClass(this.sliderContainerChilds[this.previousIndex], 'active');
    }
    this.renderer.removeClass(this.sliderContainerChilds[lastIndex], 'active');
    this.renderer.addClass(this.sliderContainerChilds[index], 'active');
  }

  // sliderConteinersDivCount
  protected getDividedBlokCount(): number {
    if (this.isBrowser) {
      return Math.ceil(this.elementLength / this.config.cellCount) + 2;
    }
    return 0;
  }

}
