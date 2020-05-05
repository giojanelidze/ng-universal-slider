import { SliderConfigType } from './ng-un-slider.interface';

export class Slider {
    public sliderConfig: SliderConfigType = {
        /**@deprecated Don't use this property */
        stabilization: true,
        simulateScroll: false,
        autoplay: true,
        interval: 3000,
        keyboard: true,
        rowCount: 1,
        hostClassPriority: 'concat',
        containerClass: {
            priority: 'concat',
            class: ''
        },
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
}
