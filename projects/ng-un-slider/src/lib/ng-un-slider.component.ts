import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewChecked
    , AfterViewInit
    , ChangeDetectorRef
    , Component
    , ElementRef
    , EventEmitter
    , HostBinding
    , HostListener
    , Inject
    , Input
    , OnInit
    , Output
    , PLATFORM_ID
    , Renderer2
    , ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { deepMerge } from './merge';
import { SlideEvent, KeyCode, SliderConfigType } from './ng-un-slider.interface';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ng-un-slider',
    templateUrl: './ng-un-slider.component.html',
    styleUrls: ['./ng-un-slider.component.scss']
})
export class NgUnSliderComponent implements OnInit, AfterViewInit, AfterViewChecked {

    @Input() class = '';
    @HostBinding('class')
    get hostClasses(): string { return [this.class, '_cs_slider'].join(' '); }

    @ViewChild('sliderContainer') _sliderContainer: ElementRef;
    private _sliderContainerChilds: ElementRef[];
    public get sliderContainerChilds(): ElementRef[] {
        if (!this._sliderContainerChilds) {
            this._sliderContainerChilds = this._sliderContainer && this._sliderContainer.nativeElement
                ? this._sliderContainer.nativeElement.children
                : [];
        }
        return this._sliderContainerChilds;
    }
    private queue: Array<boolean> = [];
    private sliderSetIndexIsRuning = false;

    @Input() public dataSource: any[];
    private _config: SliderConfigType = {
        autoplay: true,
        interval: 3000,
        keyboard: true,
        rowCount: 1,
        margin: {
            position: 'none',
            size: 0
        },
        isCircular: true,
        pause: 'hover',
        moveCount: 0,
        arrow: {
            show: true,
            position: 'body',
            left: {
                hostClass: '_cs_slider__arrow _cs_slider__arrow-left',
                iconClass: 'fas fa-angle-left',
            },
            right: {
                hostClass: '_cs_slider__arrow _cs_slider__arrow-right',
                iconClass: 'fas fa-angle-right'
            }
        },
        pagination: {
            show: true,
            hostClass: '_cs_slider__pagination',
            bulletClass: '_cs_slider__pagination-bullet'
        },
        cellCount: 1
    };
    @Input()
    public set config(v: SliderConfigType) {
        deepMerge(this._config, v);
    }
    public get config(): SliderConfigType {
        return this._config;
    }

    @Output() public outputDataSource: EventEmitter<any[]> = new EventEmitter<any[]>();
    // tslint:disable-next-line:no-output-rename
    @Output('onTouchStart') public OnTouchStartEmitter: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onTouchend') public OnTouchEndEmitter: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onTouchCancel') public OnTouchCancelEmitter: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onTouchMove') public OnTouchMoveEmitter: EventEmitter<TouchEvent> = new EventEmitter<TouchEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onMouseOver') public OnMouseOverEmitter: EventEmitter<Event> = new EventEmitter<Event>();
    // tslint:disable-next-line:no-output-rename
    @Output('onMouseLeave') public OnMouseLeaveEmitter: EventEmitter<Event> = new EventEmitter<Event>();
    // tslint:disable-next-line:no-output-rename
    @Output('onSlideStart') public OnSlideStartEmitter: EventEmitter<SlideEvent> = new EventEmitter<SlideEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onSlideEnd') public OnSlideEndEmitter: EventEmitter<SlideEvent> = new EventEmitter<SlideEvent>();
    // tslint:disable-next-line:no-output-rename
    @Output('onChangeDetection') public OnChangeDetection: EventEmitter<any> = new EventEmitter<any>();

    public get clientWidth(): number {
        return this.el && this.el.nativeElement ? (this.el.nativeElement as Element).clientWidth : 0;
    }
    private _correctTransformValue: number;
    public get correctTransformValue(): number {
        if (!this._correctTransformValue) {
            switch (this.config.margin.position) {
                case 'left':
                case 'both':
                    this._correctTransformValue = -this.config.margin.size;
                    break;
                default:
                    this._correctTransformValue = 0;
                    break;
            }
        }
        return this._correctTransformValue;
    }
    public get safeTransform(): any {
        const correctedValueForMoveCount = this.clientWidth / this.config.cellCount * this.instedIndex;
        const transformValue = Boolean(this.touchDistance)
            ? this.index * this.clientWidth + this.correctTransformValue
            + (this.config.moveCount > 0 ? correctedValueForMoveCount : 0)
            : this.index * this.clientWidth + (!this.index ? -this.config.margin.size : this.correctTransformValue)
            + (this.config.moveCount > 0 ? correctedValueForMoveCount : 0);

        const transformString: string = Boolean(this.touchDistance)
            ? `translateX(calc(-${transformValue}px${this.touchDistance > 0
                ? ' + ' : ' - '} ${Math.abs(this.touchDistance)}px))`
            : `translateX(${-(transformValue)}px)`;
        return this.sanitizer.bypassSecurityTrustStyle(transformString);
    }
    private instedIndex = 0; _index = 1; previousIndex = 0;
    public get index(): number {
        return this._index;
    }
    public set index(value: number) {
        if (this.isBrowser) {
            this.SetTimeout();
        }
        this._index = value;
    }

    public extendedList: Array<any> = new Array<any>(); transOff = false; showSlider: boolean;

    private isBrowser: boolean;
    private stopSlider: boolean;
    private touchStartX: number;
    private touchDistance: number;
    private timeoutId?: number;
    private lastX: number;
    private remains: number;
    private touchEvent: boolean;

    private _bulletCount: Array<number>;
    public get bulletCount(): Array<number> {
        if (!this._bulletCount) {
            this._bulletCount = [];
            if (this.isBrowser) {
                const count = this.dataSource && this.dataSource.length ? Math.ceil(this.dataSource.length / this.config.cellCount) : 0;
                for (let index = 0; index < count; index++) {
                    this._bulletCount.push(index);
                }
            }
        }
        return this._bulletCount;
    }

    private get sliderConteinersDivCount(): Array<number> {
        const countArray = [];
        if (this.isBrowser) {
            const count = this.sliderContainerChilds && this.sliderContainerChilds.length
                ? Math.ceil(this.sliderContainerChilds.length / this.config.cellCount)
                : 0;
            // count += this.remains ? 1 : 0;
            for (let index = 0; index < count; index++) {
                countArray.push(index);
            }
        }
        return countArray;
    }
    public itemDivCount: number;

    constructor(@Inject(PLATFORM_ID) private platformId: string
        , private sanitizer: DomSanitizer
        , private renderer: Renderer2
        , public el: ElementRef
        , public cdRef: ChangeDetectorRef) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit(): void {
        this.stopSlider = this._config.pause === true;
        const tmpExtendedList: Array<any> = JSON.parse(JSON.stringify(this.dataSource));
        if (tmpExtendedList.length <= this.config.cellCount) {
            this.config.cellCount = tmpExtendedList.length;
        }
        this.remains = tmpExtendedList.length % this.config.cellCount;
        const cutedData = tmpExtendedList.length - (this.remains
            ? tmpExtendedList.length - this.remains
            : tmpExtendedList.length - this.config.cellCount);
        this.remains === 0
            ? tmpExtendedList.unshift(...tmpExtendedList.slice(tmpExtendedList.length - this.config.cellCount
                , tmpExtendedList.length))
            : tmpExtendedList.unshift(...tmpExtendedList.slice(tmpExtendedList.length - this.remains, tmpExtendedList.length));

        tmpExtendedList.push(...tmpExtendedList.slice(cutedData, cutedData + this.config.cellCount));

        this.extendedList = tmpExtendedList;
        this.outputDataSource.emit(this.extendedList);
        if (this.isBrowser && this.config.autoplay) {
            this.SetTimeout();
        }
    }

    ngAfterViewInit() {
        this.createDivContainers();
        this.resizeDivs(1, true);
    }

    ngAfterViewChecked() {
        if (!this.cdRef['destroyed']) {
            this.cdRef.detectChanges();
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        for (let index = 0; index < this.sliderContainerChilds.length; index++) {
            this.index === index
                ? this.resizeDivs(index, true)
                : this.renderer.setStyle(this.sliderContainerChilds[index], 'width', `${this.clientWidth}px`);
        }
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        if (!this.config.keyboard) { return; }
        this.setIndex(event.keyCode === KeyCode.right ? true : (event.keyCode === KeyCode.left ? false : null));
    }

    private createDivContainers() {
        if (this.isBrowser) {
            if (!this.itemDivCount) {
                this.itemDivCount = this.sliderConteinersDivCount.length;
            }
            for (let divIndex = 0; divIndex < this.itemDivCount; divIndex++) {
                const div = this.getDivElement();
                this.renderer.appendChild(this._sliderContainer.nativeElement, div);
                for (let cellIndex = 0; cellIndex < this.config.cellCount; cellIndex++) {
                    if (divIndex === 0 && this.remains > 0 && cellIndex >= this.remains) { continue; }
                    const existingItemsCount = this.sliderContainerChilds.length - (divIndex + 1);
                    if (this.remains > 0 && existingItemsCount === this.config.cellCount
                        && divIndex !== this.itemDivCount - 1) { break; }
                    if (existingItemsCount > 0) { this.renderer.appendChild(div, this.sliderContainerChilds[0]); }
                }
            }
            this.showSlider = true;
        }
    }

    private getDivElement() {
        const div = this.renderer.createElement('div');
        div.className = '_cs_slider__container__item';
        div.style.width = `${this.clientWidth}px`;
        return div;
    }

    private resizeDivs(index: number, up: boolean) {
        const previousElementWidth = `${this.clientWidth}px`, lastIndex = index + (up ? - 1 : 1);
        if (!this.sliderContainerChilds[index] || !this.sliderContainerChilds[lastIndex]) { return; }
        switch (this.config.margin.position) {
            case 'left':
            case 'right': {
                this.renderer.setStyle(this.sliderContainerChilds[index], 'width', `${this.clientWidth - this.config.margin.size}px`);
                this.renderer.setStyle(this.sliderContainerChilds[lastIndex], 'width', previousElementWidth);
            }
                break;
            case 'both': {
                this.renderer.setStyle(this.sliderContainerChilds[index], 'width', `${this.clientWidth - this.config.margin.size * 2}px`);
                this.renderer.setStyle(this.sliderContainerChilds[lastIndex], 'width', previousElementWidth);
                if (up === false && lastIndex === this.sliderContainerChilds.length - 1) {
                    this.renderer.setStyle(this.sliderContainerChilds[0], 'width', previousElementWidth);
                }
                if (index === 1) {
                    this.renderer.setStyle(
                        this.sliderContainerChilds[this.sliderContainerChilds.length - 1],
                        'width',
                        `${this.clientWidth}px`
                    );
                }
            } break;
            case 'none': {
                this.renderer.setStyle(this.sliderContainerChilds[index], 'width', `${this.clientWidth}px`);
            }
                break;
        }

        index === 1
            ? this.renderer.removeClass(this.sliderContainerChilds[this.sliderContainerChilds.length - 1], 'active')
            : lastIndex === this.sliderContainerChilds.length - 1
                ? this.renderer.removeClass(this.sliderContainerChilds[0], 'active')
                // tslint:disable-next-line:no-unused-expression
                : null;
        this.renderer.removeClass(this.sliderContainerChilds[lastIndex], 'active');
        this.renderer.addClass(this.sliderContainerChilds[index], 'active');
    }

    private SetTimeout() {
        window.clearInterval(this.timeoutId);
        this.timeoutId = window.setTimeout(() => {
            if (!this.stopSlider && this.config.autoplay) {
                this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'forward' }));
                this.setIndex(true);
            }
        }, this._config.interval);
    }

    private changeIndexValue(up: boolean) {
        const i = (this.instedIndex + (up ? this.config.moveCount : -this.config.moveCount)) % this.config.cellCount;
        if ((up ? i < this.instedIndex : i > this.instedIndex) || !this.config.moveCount) {
            this.calculateIndex(up);
        } else {
            this.SetTimeout();
        }
        this.instedIndex = i;
    }

    private calculateIndex(up: boolean) {
        this.previousIndex = this.index;
        const condition: boolean = this.config.isCircular
            ? this.index + 1 <= this.sliderContainerChilds.length / this.config.rowCount
            : this.index + 1 < this.sliderContainerChilds.length / this.config.rowCount - 1;
        this.index = up
            ? condition
                ? this.index + 1
                : this.config.isCircular ? 1 : this.index
            : this.index > (this.config.isCircular ? 0 : 1)
                ? this.index - 1
                : this.config.isCircular ? this.sliderContainerChilds.length / this.config.rowCount - 2 : this.index;
    }

    private async setIndex(up: boolean) {
        this.queue.push(up);
        if (this.sliderSetIndexIsRuning) { return; }
        this.sliderSetIndexIsRuning = true;
        while (this.queue.length) {
            const _up = this.queue.shift();
            const data = await new Promise((resolve, reject) => {
                this.touchEvent ? this.calculateIndex(_up) : this.changeIndexValue(_up);
                if (this.index === this.sliderContainerChilds.length / this.config.rowCount - 1 || this.index === 0) {
                    this.resizeDivs(this.index, _up);
                    setTimeout(() => {
                        this.transOff = true;
                        this.OnChangeDetection.emit();
                        setTimeout(() => {
                            this.index = this.index === 0 ? this.sliderContainerChilds.length / this.config.rowCount - 2 : 1;
                            this.resizeDivs(this.index, _up);
                            this.OnChangeDetection.emit();
                            setTimeout(() => {
                                this.transOff = false;
                                this.resizeDivs(this.index, _up);
                                this.touchDistance = null;
                                this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
                                this.OnChangeDetection.emit();
                                resolve(true);
                            }, 10);
                        }, 20);
                    }, 300);
                } else {
                    this.resizeDivs(this.index, _up);
                    this.transOff = false;
                    this.touchDistance = null;
                    this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
                    resolve(true);
                }
            });
        }
        this.sliderSetIndexIsRuning = false;
    }

    public OnTouchStart($event: TouchEvent) {
        this.touchEvent = true;
        window.clearInterval(this.timeoutId);
        this.transOff = true;
        this.touchStartX = $event.touches[0].pageX;
        this.OnTouchStartEmitter.emit($event);
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'undefined' }));
    }

    public OnTouchEnd($event: TouchEvent) {
        const touchDistance = $event.changedTouches[0].pageX - this.touchStartX;
        if (Math.abs(touchDistance) > window.innerWidth * .25) {
            this.setIndex(Boolean(touchDistance < 0));
        } else {
            this.transOff = false;
            this.touchDistance = 0;
        }
        this.OnTouchEndEmitter.emit($event);
        this.touchEvent = false;
    }

    public OnTouchCancel($event: TouchEvent) {
        this.OnTouchEnd($event);
        this.OnTouchCancelEmitter.emit($event);
        this.touchEvent = false;
    }

    public OnTouchMove($event: TouchEvent) {
        this.lastX = $event.touches[0].pageX;
        if (Math.abs(this.touchStartX - this.lastX) > 16) {
            (<Event>$event).stopPropagation();
            (<Event>$event).preventDefault();
        }
        this.touchDistance = $event.touches[0].pageX - this.touchStartX;
        this.OnTouchMoveEmitter.emit($event);
    }

    public OnMouseOver($event: Event) {
        if (this._config.pause === 'hover') {
            this.stopSlider = true;
        }
        this.OnMouseOverEmitter.emit($event);
    }

    public OnMouseLeave($event: Event) {
        if (this._config.pause === true) {
            return;
        }
        this.stopSlider = false;
        if (this.isBrowser) {
            this.SetTimeout();
        }
        this.OnMouseLeaveEmitter.emit($event);
    }

    public forward(up: boolean) {
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'forward' }));
        this.setIndex(up);
    }

    public back(up: boolean) {
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'back' }));
        this.setIndex(up);
    }

    private getSlideEventsData(source: SlideEvent): SlideEvent {
        return Object.assign(<SlideEvent>{
            index: { current: this.index, previous: this.previousIndex },
            activeElement: {
                current: this.sliderContainerChilds[this.index],
                previous: this.sliderContainerChilds[this.previousIndex]
            },
            page: {
                active: this.index,
                total: this.bulletCount.length
            }
        }, source);
    }

    // private isOutOfViewport(elem: HTMLElement) {
    //     const bounding = elem.getBoundingClientRect();
    //     // Check if it's out of the viewport on each side
    //     const top = bounding.top < 0;
    //     const left = bounding.left < 0;
    //     const bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
    //     const right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
    //     const any = top || left || bottom || right;
    //     return any;
    // }
}





