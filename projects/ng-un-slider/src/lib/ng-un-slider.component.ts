import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit
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
import { Subject, Observable } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { deepMerge } from './merge';
import { KeyCode, SlideEvent, SliderConfigType } from './ng-un-slider.interface';
import { Queue } from './queue';
import { Slider } from './slider';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ng-un-slider',
    templateUrl: './ng-un-slider.component.html',
    styleUrls: ['./ng-un-slider.component.scss']
})
export class NgUnSliderComponent implements OnInit, AfterViewInit {
    @Input() class = '';
    @HostBinding('class') get hostClasses(): string { return [this.class, '_cs_slider'].join(' '); }
    @ViewChild('sliderContainer') _sliderContainer: ElementRef;
    public sliderContainerWidth = 0;
    private childDivsWidth = 0;
    public dataIsReordered = false;
    private _sliderContainerChilds: ElementRef[];
    public get sliderContainerChilds(): ElementRef[] {
        if (!this._sliderContainerChilds) {
            this._sliderContainerChilds = this._sliderContainer && this._sliderContainer.nativeElement
                ? this._sliderContainer.nativeElement.children
                : [];
        }
        return this._sliderContainerChilds;
    }

    private completed = true;
    private _dataSource: any[];
    public get dataSource(): any[] {
        return this._dataSource;
    }
    // https://nitayneeman.com/posts/listening-to-dom-changes-using-mutationobserver-in-angular/
    @Input()
    public set dataSource(v: any[]) {
        if (this._dataSource) {
            this.initializeDefaultValues();
            this.removeDivContainers();
            this._dataSource = v;
            this.modifyDataSource();
            this.transOff = true;
            const observer = new MutationObserver((mutations) => {
                this.onDataSourceChange();
                this.OnChangeDetection.emit();
                observer.disconnect();
            });
            observer.observe(this._sliderContainer.nativeElement, {
                childList: true
            });

        } else {
            this._dataSource = v;
        }
    }


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
                    this._correctTransformValue = -this.config.margin.size;
                    break;
                case 'both':
                    this._correctTransformValue = 0;
                    break;
                default:
                    this._correctTransformValue = 0 /*this.index !== 1 ? -(this.config.margin ? this.config.margin.size : 0) : 0*/;
                    break;
            }
        }
        return this._correctTransformValue;
    }
    private _safeTransform = 30;
    public get safeTransform(): any {
        if (!this.dataIsReordered) { return; }
        const correctedValueForMoveCount = (this.clientWidth - (this.config.margin ? this.config.margin.size : 0))
            / this.config.cellCount * this.instedIndex;
        const width = (<any>this.sliderContainerChilds[this.previousIndex]).clientWidth + this.correctTransformValue;

        const defaultCalculationTransform = this.calculateTransformValue(this.index)
            + (this.config.moveCount > 0 ? correctedValueForMoveCount : 0) + this.correctTransformValue;
        this._safeTransform = Boolean(this.touchDistance)
            ? this.index * width + (this.config.moveCount > 0 ? correctedValueForMoveCount : 0)
            : defaultCalculationTransform;

        // this.transformValue = Boolean(this.touchDistance)
        //     ? this.touchDistance > 0
        //         ? this._safeTransform + Math.abs(this.touchDistance)
        //         : this._safeTransform - Math.abs(this.touchDistance)
        //     : this._safeTransform * -1;
        // console.log('this.transformValue ====', this.transformValue);

        const transformString: string = Boolean(this.touchDistance)
            ? `translateX(calc(-${this._safeTransform}px${this.touchDistance > 0
                ? ' + ' : ' - '} ${Math.abs(this.touchDistance)}px))`
            : `translateX(${-(this._safeTransform)}px)`;
        this.addOrRemoveClass$.next(true);
        return this.sanitizer.bypassSecurityTrustStyle(transformString);
    }
    private instedIndex = 0; _index = 1; previousIndex = 0;
    public get index(): number {
        return this._index;
    }
    public set index(value: number) {
        this.previousIndex = this.index;
        if (this.isBrowser) {
            this.resizeDivs(value, value > this.previousIndex);
            this.SetTimeout();
        }
        this._index = value;
    }

    public extendedList: Array<any> = new Array<any>(); transOff = true; showSlider: boolean;
    private queue: Queue = new Queue();
    private slider: Slider = new Slider();

    private startTime = 0;
    private timerInstance;
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
            const count = this.dataSource && this.dataSource.length
                ? Math.ceil(this.dataSource.length / this.config.cellCount) + 2
                : 0;
            for (let index = 0; index < count; index++) {
                countArray.push(index);
            }
        }
        return countArray;
    }
    public itemDivCount: number;
    private windowResizeStream: Subject<any> = new Subject<any>();
    private addOrRemoveClass$: Subject<any> = new Subject<any>();

    constructor(@Inject(PLATFORM_ID) private platformId: string
        , private sanitizer: DomSanitizer
        , private renderer: Renderer2
        , public el: ElementRef
        , public cdRef: ChangeDetectorRef) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        // setTimeout(() => {
        //     this.simulateSmoothTranssform(5);
        // }, 2000);

        this.windowResizeStream
            .pipe(debounceTime(200))
            .subscribe(() => {
                this.stopSlider = true;
                this.transOff = true;
                let sliderContainerWidth = 0;
                for (let index = 0; index < this.sliderContainerChilds.length; index++) {
                    let containerWidth = `${this.clientWidth - (this.config.margin ? this.config.margin.size : 0)}`;
                    if ((<any>this.sliderContainerChilds[index]).children.length < this.config.cellCount) {
                        const width = this.clientWidth - (this.config.margin ? this.config.margin.size : 0);
                        containerWidth = `${width * ((<any>this.sliderContainerChilds[index]).children.length / this.config.cellCount)}`;
                    }
                    sliderContainerWidth += Number(containerWidth);
                    this.renderer.setStyle(this.sliderContainerChilds[index], 'width', `${containerWidth}px`);
                    this.OnChangeDetection.emit();
                }
                this.sliderContainerWidth = sliderContainerWidth;
                this.OnChangeDetection.emit();
                setTimeout(() => {
                    this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
                    this.stopSlider = this.config.pause === true;
                }, 10);
            });

        this.addOrRemoveClass$
            .pipe(debounceTime(330))
            .subscribe(() => this.addOrRemoveClass());
    }

    private initializeDefaultValues() {
        this.class = '';
        this.sliderContainerWidth = 0;
        this.dataIsReordered = false;
        this._sliderContainerChilds = undefined;
        this._correctTransformValue = undefined;
        this._safeTransform = 0;
        this.instedIndex = 0;
        this.index = 1;
        this.previousIndex = 0;
        this.stopSlider = false;
        this.touchStartX = undefined;
        this.touchDistance = undefined;
        this.timeoutId = null;
        this.lastX = 0;
        this.remains = 0;
        this.touchEvent = false;
        this._bulletCount = undefined;
        this.itemDivCount = undefined;
    }

    modifyDataSource(): void {
        this.stopSlider = this.slider.sliderConfig.pause === true;
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
        } else {
            this.dataIsReordered = true;
            this.OnChangeDetection.emit();
        }
    }

    ngOnInit(): void {
        this.modifyDataSource();
    }

    ngAfterViewInit() {
        this.onDataSourceChange();
    }

    onDataSourceChange() {
        this.createDivContainers();
        this.resizeDivs(1, true);
        this.dataIsReordered = true;
        setTimeout(() => this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff, 500);
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        if (!this.config.keyboard || (event.keyCode !== KeyCode.right && event.keyCode !== KeyCode.left)) { return; }
        this.setIndex(event.keyCode === KeyCode.right ? true : false);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.windowResizeStream.next(true);
    }

    private removeDivContainers() {
        while (this.sliderContainerChilds.length) {
            if (this.sliderContainerChilds.hasOwnProperty(0)) {
                const element = this.sliderContainerChilds[0];
                this.renderer.removeChild(this._sliderContainer.nativeElement, element);
            }
        }
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
                if (div.children.length < this.config.cellCount) {
                    const width = this.clientWidth - (this.config.margin ? this.config.margin.size : 0);
                    this.childDivsWidth = width * (div.children.length / this.config.cellCount);
                    div.style.width = `${this.childDivsWidth}px`;

                }
                this.sliderContainerWidth += Number(String(div.style.width).replace('px', ''));
            }
            this.showSlider = true;
        }
    }

    private getDivElement() {
        const div = this.renderer.createElement('div');
        div.className = '_cs_slider__container__item';
        this.childDivsWidth = this.clientWidth - (this.config.margin ? this.config.margin.size : 0);
        div.style.width = `${this.childDivsWidth}px`;
        return div;
    }

    private resizeDivs(index: number, up: boolean) {

        const previousElementWidth = `${this.clientWidth - (this.config.margin ? this.config.margin.size : 0)}px`,
            lastIndex = (index + (up ? -1 : 1)) < 0
                || (index + (up ? -1 : 1)) === this.sliderContainerChilds.length
                ? 0 : (index + (up ? -1 : 1));
        if (!this.sliderContainerChilds[index] || !this.sliderContainerChilds[lastIndex]) { return; }
        // TODO: Move in to method
        if (index === 1) {
            this.renderer.removeClass(this.sliderContainerChilds[this.sliderContainerChilds.length - 1], 'active');
        } else {
            if (lastIndex === this.sliderContainerChilds.length - 1) {
                this.renderer.removeClass(this.sliderContainerChilds[0], 'active');
            }
        }
        this.renderer.removeClass(this.sliderContainerChilds[this.previousIndex], 'active');
        this.renderer.removeClass(this.sliderContainerChilds[lastIndex], 'active');
        this.renderer.addClass(this.sliderContainerChilds[index], 'active');
    }

    private addVisibleClass(element: any) {
        for (const key in element.children) {
            if (element.children.hasOwnProperty(key)) {
                if (this.elementInViewport(element.children[key])) {
                    this.renderer.addClass(element.children[key], 'visible');
                } else {
                    this.renderer.removeClass(element.children[key], 'visible');
                }
            }
        }
    }

    private addPartialVisibleClass(element: any) {
        for (const key in element.children) {
            if (element.children.hasOwnProperty(key)) {
                if (!this.elementInViewport(element.children[key]) && this.isAnyPartOfElementInViewport(element.children[key])) {
                    this.renderer.addClass(element.children[key], 'partial-visible');
                } else {
                    this.renderer.removeClass(element.children[key], 'partial-visible');
                }
            }
        }
    }

    private addActiveClass(element: any) {
        if (this.isAnyPartOfElementInViewport(element)) {
            this.renderer.addClass(element, 'active');
        } else {
            this.renderer.removeClass(element, 'active');
        }
    }


    private SetTimeout() {
        window.clearInterval(this.timeoutId);
        this.timeoutId = window.setTimeout(() => {
            if (!this.stopSlider && this.config.autoplay) {
                this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'forward' }));
                this.setIndex(true);
            }
        }, this.slider.sliderConfig.interval);
    }

    private changeIndexValue(up: boolean) {
        let i = (this.instedIndex + (up ? this.config.moveCount : -this.config.moveCount)) % this.config.cellCount;
        if (i === -1) {
            this.calculateIndex(up);
            i = (<any>this.sliderContainerChilds[this.index]).children.length - 1;
        } else
            if ((up ? i < this.instedIndex : i > this.instedIndex) || !this.config.moveCount) {
                this.calculateIndex(up);
            } else {
                this.SetTimeout();
            }
        if (i + 1 > (<any>this.sliderContainerChilds[this.index]).children.length) {
            this.calculateIndex(up);
            return;
        }
        this.instedIndex = i;
    }

    private calculateIndex(up: boolean) {
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


    private async setIndex(up: boolean, index?: number) {
        if (!this.completed) { return; }

        this.queue.execute(async () => {
            if (!this.touchEvent) {
                this.changeIndexValue(up);
            }
            // this.touchEvent ? this.calculateIndex(up) : this.changeIndexValue(up);
            this.OnChangeDetection.emit();
            if (this.index === this.sliderContainerChilds.length / this.config.rowCount - 1 || this.index === 0) {
                this.completed = false;
                this.resizeDivs(this.index, up);
                this.transOff = Boolean(this.touchDistance) ? this.config.isCircular || this.config.autoplay
                    ? false
                    : this.transOff : this.transOff;
                this.touchDistance = null;
                // TODO: გადასაკეთებელია async await -ად
                setTimeout(() => {
                    this.transOff = true;
                    this.OnChangeDetection.emit();
                    setTimeout(() => {
                        const _index = this.index === 0 ? this.sliderContainerChilds.length / this.config.rowCount - 2 : 1;
                        if (_index === this.sliderContainerChilds.length - 2) {
                            this.resizeDivs(this.sliderContainerChilds.length - 1, up);
                        }
                        this.index = this.index === 0 ? this.sliderContainerChilds.length / this.config.rowCount - 2 : 1;
                        this.resizeDivs(this.index, up);
                        this.OnChangeDetection.emit();
                        setTimeout(() => {
                            this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
                            this.resizeDivs(this.index, up);
                            this.touchDistance = null;
                            this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
                            this.OnChangeDetection.emit();
                            this.completed = true;
                        }, 10);
                    }, 20);
                }, 300);
            } else {
                this.resizeDivs(this.index, up);
                this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
                this.touchDistance = null;
                this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
            }
        });
    }

    private addOrRemoveClass() {
        for (const key in this.sliderContainerChilds) {
            if (this.sliderContainerChilds.hasOwnProperty(key)) {
                this.addVisibleClass(this.sliderContainerChilds[key]);
                this.addPartialVisibleClass(this.sliderContainerChilds[key]);
            }
        }
        this.OnChangeDetection.emit();
    }

    public OnTouchStart($event: TouchEvent) {
        if (this.timerInstance) { clearInterval(this.timerInstance); this.clearTranformData(); return; }
        this.startTime = performance.now();
        this.touchEvent = true;
        window.clearInterval(this.timeoutId);
        this.transOff = true;
        this.touchStartX = $event.touches[0].pageX;
        this.OnTouchStartEmitter.emit($event);
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'undefined' }));
    }

    public OnTouchEnd($event: TouchEvent) {
        const touchDistance = $event.changedTouches[0].pageX - this.touchStartX;
        const speed = this.startTime ? Math.abs(touchDistance / (performance.now() - this.startTime)) : 0;
        if (speed > 1) {
            this.simulateSmoothTranssform(Boolean(touchDistance < 0), speed);
        } else {
            // if (Math.abs(touchDistance) > window.innerWidth * .25) {
            //     this.setIndex(Boolean(touchDistance < 0));
            // } else {
            //     this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
            //     this.touchDistance = null;
            // }
            this.clearTranformData();
            this.stabilizeSliderPosition(Boolean(touchDistance < 0), touchDistance);
        }
        this.OnTouchEndEmitter.emit($event);
        this.OnChangeDetection.emit();
    }

    public OnTouchCancel($event: TouchEvent) {
        this.OnTouchEnd($event);
        this.OnTouchCancelEmitter.emit($event);
        this.touchEvent = false;
        console.log('OnTouchCancel');
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
        if (this.slider.sliderConfig.pause === 'hover') {
            this.stopSlider = true;
        }
        this.OnMouseOverEmitter.emit($event);
    }

    public OnMouseLeave($event: Event) {
        if (this.slider.sliderConfig.pause === true) {
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

    public calculateTransformValue(index: number): number {
        let i = 0, result = 0;
        while (i < index) {
            result += Number((<any>this.sliderContainerChilds[i++]).style.width.replace('px', ''));
        }
        return result;

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
    elementInViewport(el: any) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    isAnyPartOfElementInViewport(el: any) {
        const rect = el.getBoundingClientRect();
        // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

        // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

        return (vertInView && horInView);
    }


    test(num: number, str: string): void {
        console.log('function is called ', num, str);

    }

    simulateSmoothTranssform(up: boolean, speed: number, frictio: number = 0.98) {
        this.transOff = true;
        // this.touchDistance = -810;
        this.changeTransformValue(up, speed, frictio, 0);
    }

    changeTransformValue(up: boolean, speed: number, frictio: number, index: number) {
        this.timerInstance = setInterval(() => {
            if (speed < 0.1) {
                this.stabilizeSliderPosition(up, this.touchDistance);
                this.clearTranformData();
                return;
            }
            const touchDistance = up ? this.touchDistance - speed * 10 : this.touchDistance + speed * 10;
            const transformValue = this.getTransformvalue();

            if (Math.abs(transformValue) > this.sliderContainerWidth - this.childDivsWidth * 2) {
                const transval = this.sliderContainerWidth - this.childDivsWidth * 2;
                this.touchDistance = up ? transval * -1 : transval;
                this.stabilizeSliderPosition(up, this.touchDistance);
                this.clearTranformData();
                return;
            } else if (transformValue > 0) {
                this.touchDistance = 0;
                this.stabilizeSliderPosition(up, this.touchDistance);
                this.setIndex(up);
                this.clearTranformData();
                return;
            }
            this.touchDistance = touchDistance;
            speed = index % 3 === 0 ? speed * frictio : speed;
            this.OnChangeDetection.emit();
        }, 5);
    }

    clearTranformData() {
        clearInterval(this.timerInstance);
        this.timerInstance = undefined;
        this.startTime = 0;
        this.touchEvent = false;

    }

    stabilizeSliderPosition(up: boolean, touchDistance: number) {
        const value = Math.abs(this.getTransformvalue() / this.childDivsWidth);
        this.index = up ? Math.ceil(value) : Math.floor(value);
        if (Math.abs(touchDistance) > window.innerWidth * .25) {
            this.setIndex(Boolean(touchDistance < 0));
        } else {
            this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
            this.touchDistance = null;
        }
    }

    getTransformvalue(): number {
        const style = window.getComputedStyle(this._sliderContainer.nativeElement);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

}





