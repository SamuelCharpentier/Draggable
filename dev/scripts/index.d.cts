type Position = {
    x: number;
    y: number;
};
type StampedPosition = {
    timestamp: number;
    position: {
        x: number;
        y: number;
    };
};
declare class Dragable {
    DOMelement: HTMLElement;
    private mouseData;
    direction: {
        x: boolean;
        y: boolean;
    };
    translatePosition?: Position;
    slide: boolean;
    private animationOptions;
    bounce: boolean;
    private velocity?;
    private slideAnimation?;
    mouseEnterHandler: () => void;
    mouseLeaveHandler: () => void;
    mouseDownHandler: (event: MouseEvent) => void;
    mouseUpHandler: (event: MouseEvent) => void;
    mouseMoveHandler: (event: MouseEvent) => void;
    constructor(DOMelement: HTMLElement | null, { slide, slideOptions: { duration, easingFactor, }, bounce, axis: { x, y }, }?: {
        slide?: boolean;
        slideOptions?: {
            duration?: number;
            easingFactor: number;
        };
        bounce?: boolean;
        axis?: {
            x: boolean;
            y: boolean;
        };
    });
    mouseEnterMethod(): void;
    mouseLeaveMethod(): void;
    mouseDownMethod(event: MouseEvent): void;
    setMouseDownData({ pageX: x, pageY: y }: MouseEvent, timestamp: number): void;
    mouseMoveMethod(event: MouseEvent): void;
    setMouseMoveData({ pageX, pageY }: MouseEvent, timestamp: number): {
        present: StampedPosition;
        last: StampedPosition;
    };
    drag({ present, last, }: {
        present: StampedPosition;
        last: StampedPosition;
    }): void;
    mouseUpMethod(event: MouseEvent): void;
    setReleaseVelocity(): boolean;
    startAnimateSlide(): void;
    animateSlide(): void;
    easeOutProgress(progress: number): number;
    stopSlideAnimation(): void;
    translate({ distanceX, distanceY, }?: {
        distanceX?: number;
        distanceY?: number;
    }): void;
    getCurrentTranslate(): {
        x: number;
        y: number;
    };
    resetTranslate(): void;
}

export { Dragable };
