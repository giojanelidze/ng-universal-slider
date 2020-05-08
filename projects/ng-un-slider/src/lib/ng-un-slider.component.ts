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
    , OnChanges
    , Output
    , PLATFORM_ID
    , Renderer2
    , SimpleChanges
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DomManipulatorComponent } from './dom-manipulator/dom-manipulator.component';
import { KeyCode, SlideEvent } from './ng-un-slider.interface';
import { Queue } from './queue';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ng-un-slider',
    templateUrl: './ng-un-slider.component.html',
    styleUrls: ['./ng-un-slider.component.scss']
})
export class NgUnSliderComponent extends DomManipulatorComponent implements AfterViewInit, OnChanges {
    @Input() class = '';
    @HostBinding('class') get hostClasses(): string {
        return [this.class, this.config.hostClassPriority === 'concat' ? '_cs_slider' : ''].join(' ');
    }
    public dataIsReordered = false;

    // https://nitayneeman.com/posts/listening-to-dom-changes-using-mutationobserver-in-angular/
    @Input() public dataSource: any[];

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

    private _correctTransformValue: number;
    public get correctTransformValue(): number {
        if (!this._correctTransformValue) {
            switch (this.config.margin.position) {
                case 'left':
                    this._correctTransformValue = -this.config.margin.size;
                    break;
                case 'both':
                    this._correctTransformValue = -this.config.margin.size;
                    break;
                default:
                    this._correctTransformValue = 0 /*this.index !== 1 ? -(this.config.margin ? this.config.margin.size : 0) : 0*/;
                    break;
            }
        }
        return this._correctTransformValue;
    }

    private up: boolean;
    private completed = true;
    private _safeTransform = 30;
    private startTransform = 0;
    private deviation = 0;
    public get safeTransform(): any {
        if (!this.dataIsReordered) { return; }
        let correctedValueForMoveCount = 0;
        if (this.config.moveCount > 0) {
            correctedValueForMoveCount = (this.clientWidth - (this.config.margin ? this.config.margin.size : 0))
                / this.config.cellCount * this.instedIndex;
        }

        this._safeTransform = Boolean(this.touchDistance)
            ? this.startTransform + this.correctTransformValue + correctedValueForMoveCount
            : this.defaultCalculationTransform(correctedValueForMoveCount) + this.deviation;


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
            if (this.config.autoplay) {
                this.SetTimeout();
            }
        }
        this._index = value;
    }

    public transOff = true;

    private startTime = 0;
    private timerInstance;
    private lastX: number;
    private timeoutId?: number;
    private touchEvent: boolean;
    private stopSlider: boolean;
    private touchStartX: number;
    private touchDistance: number;
    private queue: Queue = new Queue();

    private _bulletCount: Array<number>;
    public get bulletCount(): Array<number> {
        if (!this._bulletCount) {
            this._bulletCount = [];
            if (this.isBrowser) {
                const count = this.dataSource && this.dataSource.length
                    ? Math.ceil(this.dataSource.length / this.config.cellCount)
                    : 0;
                for (let index = 0; index < count; index++) {
                    this._bulletCount.push(index);
                }
            }
        }
        return this._bulletCount;
    }

    private windowResizeStream: Subject<any> = new Subject<any>();
    private addOrRemoveClass$: Subject<any> = new Subject<any>();

    constructor(@Inject(PLATFORM_ID) public platformId: string
        , private sanitizer: DomSanitizer
        , public renderer: Renderer2
        , public el: ElementRef
        , public cdRef: ChangeDetectorRef) {
        super(platformId, renderer, el);

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
        this.dataIsReordered = false;
        this._correctTransformValue = undefined;
        this._safeTransform = 0;
        this.instedIndex = 0;
        this.index = 1;
        this.previousIndex = 0;
        this.stopSlider = false;
        this.touchStartX = undefined;
        this.touchDistance = 0;
        this.timeoutId = null;
        this.lastX = 0;
        this.touchEvent = false;
        this._bulletCount = undefined;
        this.resetConfiguration();
    }

    public defaultCalculationTransform(correctedValueForMoveCount: number): number {
        return this.calculateTransformValue(this.index) + (this.config.moveCount > 0
            ? correctedValueForMoveCount
            : 0) + this.correctTransformValue;
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

        this.outputDataSource.emit(tmpExtendedList);
        if (this.isBrowser && this.config.autoplay) {
            this.SetTimeout();
        } else {
            this.dataIsReordered = true;
            this.OnChangeDetection.emit();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dataSource) {
            if (changes.dataSource.previousValue) {
                this.initializeDefaultValues();
                this.removeDivContainers();
                this.transOff = true;
                const observer = new MutationObserver((mutations) => {
                    this.onDataSourceChange();
                    this.OnChangeDetection.emit();
                    observer.disconnect();
                });
                observer.observe(this._sliderContainer.nativeElement, {
                    childList: true
                });
            }
            this.elementLength = changes.dataSource.currentValue.length;
            this.modifyDataSource();
        }
    }

    ngAfterViewInit() {
        this.onDataSourceChange();
    }

    onDataSourceChange() {
        this.createDivContainers();
        this.resizeDivs(1, true);
        this.dataIsReordered = true;
        setTimeout(() => this.transOff = false, 500);
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        if (!this.config.keyboard || (event.keyCode !== KeyCode.right && event.keyCode !== KeyCode.left)) {
            return;
        }
        this.setIndex(event.keyCode === KeyCode.right ? true : false);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.windowResizeStream.next(true);
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
            if (!this.touchEvent && !index) {
                this.changeIndexValue(up);
            }
            // this.touchEvent ? this.calculateIndex(up) : this.changeIndexValue(up);
            this.OnChangeDetection.emit();
            if (this.index >= this.sliderContainerChilds.length / this.config.rowCount - 1 || this.index === 0) {
                this.completed = false;
                this.resizeDivs(this.index, up);
                this.transOff = Boolean(this.touchDistance) ? this.config.isCircular || this.config.autoplay
                    ? false
                    : this.transOff : this.transOff;
                this.touchDistance = 0;
                // TODO: გადასაკეთებელია async await -ად
                setTimeout(() => {
                    this.transOff = true;
                    this.OnChangeDetection.emit();
                    setTimeout(() => {
                        const _index = this.index === 0 ? this.sliderContainerChilds.length / this.config.rowCount - 2 : 1;
                        if (_index === this.sliderContainerChilds.length - 2) {
                            this.resizeDivs(this.sliderContainerChilds.length - 1, up);
                        }
                        this.index = this.index === 0
                            ? this.sliderContainerChilds.length / this.config.rowCount - 2
                            : this.config.isCircular
                                ? 1
                                : this.index;
                        this.resizeDivs(this.index, up);
                        this.OnChangeDetection.emit();
                        setTimeout(() => {
                            this.transOff = false;
                            // this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
                            this.resizeDivs(this.index, up);
                            this.touchDistance = 0;
                            this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
                            this.OnChangeDetection.emit();
                            this.completed = true;
                            // this.startTransform = this.getWidthFromIndex(this.index);
                        }, 10);
                    }, 20);
                }, 300);
            } else {
                this.resizeDivs(this.index, up);
                this.transOff = false;
                this.touchDistance = 0;
                this.OnSlideEndEmitter.emit(this.getSlideEventsData(<SlideEvent>{}));
                this.OnChangeDetection.emit();
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
        this.startTransform = Math.abs(this.getTransformvalue());
        if (this.timerInstance) {
            this.completed = true;
            if (!this.config.stabilization) {
                this.deviation = Math.abs(this.getTransformvalue()) - Math.abs(this.getWidthFromIndex(this.index));
                console.log(`გადახრა =`, this.deviation);
            }
            this.simulateSmoothTranssform(this.up, 0);
        }
        if (!this.completed) { return; }
        this.startTime = performance.now();
        this.touchEvent = true;
        window.clearInterval(this.timeoutId);
        this.transOff = true;
        this.touchStartX = $event.touches[0].pageX;
        this.OnTouchStartEmitter.emit($event);
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'undefined' }));
    }


    public OnTouchEnd($event: TouchEvent) {
        this.transOff = false;
        const touchDistance = $event.changedTouches[0].pageX - this.touchStartX;
        if (Math.abs(touchDistance) < 16) { return; }
        const speed = this.startTime ? Math.abs(touchDistance / (performance.now() - this.startTime)) : 0;
        this.up = Boolean(touchDistance < 0);
        if (this.config.simulateScroll && speed > this.config.speed.max) {
            this.simulateSmoothTranssform(this.up, speed);
        } else {
            this.stabilizeSliderPosition(this.up, touchDistance, speed);
            this.clearTranformData();
        }
        this.lastX = 0;
        this.OnTouchEndEmitter.emit($event);
        this.OnChangeDetection.emit();

        if (speed < this.config.speed.max && !this.config.stabilization) {
            this.deviation = Math.abs(this.getTransformvalue()) - Math.abs(this.getWidthFromIndex(this.index));
            console.log(`გადახრა =`, this.deviation);

        }

    }

    public OnTouchCancel($event: TouchEvent) {
        this.OnTouchEnd($event);
        this.OnTouchCancelEmitter.emit($event);
        this.touchEvent = false;
        this.lastX = 0;
    }

    public OnTouchMove($event: TouchEvent) {

        if (Math.abs(this.touchStartX - this.lastX) > 16) {
            (<Event>$event).stopPropagation();
            (<Event>$event).preventDefault();
        }
        const touchDistance = this.touchDistance
            ? this.touchDistance + $event.touches[0].pageX - this.lastX
            : $event.touches[0].pageX - this.touchStartX;
        if (!this.config.isCircular && (((touchDistance < 0 && this.index === this.sliderContainerChilds.length - 2))
            || (touchDistance > 0 && this.index === 1))) {
            return;
        }
        this.touchDistance = touchDistance;
        this.lastX = $event.touches[0].pageX;
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
        this.touchEvent = false;
        this.deviation = 0;
        this.OnSlideStartEmitter.emit(this.getSlideEventsData(<SlideEvent>{ moveTo: 'forward' }));
        this.setIndex(up);
    }

    public back(up: boolean) {
        this.touchEvent = false;
        this.deviation = 0;
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
            const element: any = this.sliderContainerChilds[i++];
            if (element) {
                result += Number(element.style.width.replace('px', ''));
            }
        }
        return result;

    }

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

    simulateSmoothTranssform(up: boolean, speed: number, frictio: number = 0.98) {
        this.transOff = true;
        this.changeTransformValue(up, speed, frictio, 0);
    }

    changeTransformValue(up: boolean, speed: number, frictio: number, index: number) {
        window.cancelAnimationFrame(this.timerInstance);
        const transformValue = this.getTransformvalue();
        const absTransformValue = Math.abs(transformValue);

        const value = (absTransformValue + this.childDivsWidth - (<any>this.sliderContainerChilds[0]).clientWidth) / this.childDivsWidth;
        if (speed < this.config.speed.min && transformValue <= Math.round(value) * this.childDivsWidth) {
            speed = 0;
            // if (this.config.stabilization) {
            this.stabilizeSliderPosition(up, this.touchDistance);
            // }
            this.OnChangeDetection.emit();
            // this.setIndex(up, this.index);
            this.clearTranformData();
            this.OnChangeDetection.emit();
            if (!this.config.stabilization) {
                this.deviation = Math.abs(this.getTransformvalue()) - Math.abs(this.getWidthFromIndex(this.index));
            }
            console.log(`გადახრა =`, this.deviation);
            return;
        }
        const touchDistance = up ? this.touchDistance - speed * 30 : this.touchDistance + speed * 30;

        if (absTransformValue >= this.sliderContainerWidth - this.childDivsWidth) {
            const transval = this.sliderContainerWidth - this.childDivsWidth * 2;
            this.touchDistance = up ? -transval : transval;
            this.stabilizeSliderPosition(up, this.touchDistance);
            this.OnChangeDetection.emit();
            this.clearTranformData();
            return;
        } else if (transformValue >= 0) {
            this.touchDistance = 0;
            this.stabilizeSliderPosition(up, this.touchDistance);
            this.OnChangeDetection.emit();
            this.setIndex(up, 1);
            this.OnChangeDetection.emit();
            this.clearTranformData();
            return;
        }
        this.touchDistance = touchDistance;
        speed = index % 3 === 0 && speed > 0.1 ? speed * frictio : speed;
        this.OnChangeDetection.emit();

        this.timerInstance = requestAnimationFrame(() => {
            this.changeTransformValue.apply(this, [up, speed, frictio, index]);
        });
    }

    clearTranformData() {
        if (this.timerInstance) {
            cancelAnimationFrame(this.timerInstance);
            this.timerInstance = undefined;
        }
        this.startTime = 0;
        this.touchEvent = false;

    }

    stabilizeSliderPosition(up: boolean, touchDistance: number, speed: number = 0) {
         const transValue = this.getTransformvalue();
        const value = transValue >= 0
            ? 0
            : ((Math.abs(transValue)
                + this.childDivsWidth - (<any>this.sliderContainerChilds[0]).clientWidth) / this.childDivsWidth);
        speed = speed > 1 ? 1 : speed;
        const _index = Math.round(value + (up ? 1 * speed : -1 * speed));
        this.index = _index >= this.sliderContainerChilds.length
            ? this.config.isCircular ? this.sliderContainerChilds.length - 1 : this.sliderContainerChilds.length - 2
            : _index === 0 ? this.config.isCircular ? _index : 1 : _index;
        console.log('index =', this.index);

        if (Math.abs(touchDistance)) {
            this.setIndex(Boolean(touchDistance < 0), this.index);
        } else {
            this.transOff = this.config.isCircular || this.config.autoplay ? false : this.transOff;
            this.touchDistance = 0;
        }
    }

    getTransformvalue(): number {
        const style = window.getComputedStyle(this._sliderContainer.nativeElement);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m41;
    }

    getWidthFromIndex(index: number) {
        let width = 0;
        let i = 0;
        while (i < index) {
            width += (<any>this.sliderContainerChilds[i++]).clientWidth;
        }
        return width;
    }

}
