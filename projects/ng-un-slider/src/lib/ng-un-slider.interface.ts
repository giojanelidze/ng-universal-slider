import { ElementRef } from '@angular/core';

export interface SliderConfigType {
    /**
     * The amount of time to delay between automatically cycling an item.
     * If false, carousel will not automatically cycle.
     */
    interval?: number;
    /**
     * Whether the carousel should react to keyboard events.
     */
    keyboard?: boolean;
    /**
     * If set to "hover", pauses the cycling of the carousel on mouseenter and resumes the cycling of the carousel on mouseleave.
     */
    pause?: 'hover' | boolean;
    hostClassPriority?: 'concat' | 'absolute';
    containerClass?: {
        priority?: 'concat' | 'absolute'
        class?: string;
    };
    margin?: {
        position: 'left' | 'right' | 'both' | 'none',
        size: number
    };
    autoplay?: boolean;
    simulateScroll?: boolean;
    moveCount?: number;
    isCircular?: boolean;
    pagination?: {
        show: boolean;
        hostClass?: string;
        bulletClass?: string;
    };
    arrow?: {
        show?: boolean;
        position?: 'header' | 'body' /*| 'footer'*/
        left?: ArrowType;
        right?: ArrowType;
    };
    cellCount?: number;
    // autoCalculateCellCount?: boolean;
    rowCount?: number;
    stabilization?: boolean;
    speed?: {
        min: number
        max: number
    };
}

export interface ArrowType {
    hostClass?: string;
    iconClass?: string;
}

export interface SlideEvent {
    moveTo: 'forward' | 'back' | 'undefined';
    index: {
        previous?: number;
        current: number;
    };
    activeElement: {
        previous: ElementRef,
        current: ElementRef,
    };
    page: {
        active: number;
        total: number;
    };
}
export enum KeyCode {
    right = 39,
    left = 37
}
