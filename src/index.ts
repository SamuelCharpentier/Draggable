type Position = { x: number; y: number };

type StampedPosition = {
	timestamp: number;
	position: {
		x: number;
		y: number;
	};
};

function isStampedPosition(
	data: any,
): data is StampedPosition {
	return (
		data?.timestamp !== undefined &&
		data?.position.x !== undefined &&
		data?.position.y !== undefined &&
		typeof data.timestamp === 'number' &&
		typeof data.position.x === 'number' &&
		typeof data.position.y === 'number'
	);
}

export class Dragable {
	DOMelement: HTMLElement;
	private mouseData: {
		mouseMove?: {
			present: StampedPosition;
			last: StampedPosition;
		};
		mouseDown?: StampedPosition;
	};
	direction: { x: boolean; y: boolean };
	translatePosition?: Position;
	slide: boolean;
	private animationOptions: {
		duration: number;
		easingFactor: number;
	};
	bounce: boolean;
	private velocity?: {
		speed: number;
		angle: number;
	};
	private slideAnimation?: {
		startTimestamp: number;
		timestamp: number;
		rafID: number;
	};
	mouseEnterHandler: () => void;
	mouseLeaveHandler: () => void;
	mouseDownHandler: (event: MouseEvent) => void;
	mouseUpHandler: (event: MouseEvent) => void;
	mouseMoveHandler: (event: MouseEvent) => void;

	constructor(
		DOMelement: HTMLElement | null,
		{
			slide = true,
			slideOptions: {
				duration = 1500,
				easingFactor = 4,
			} = {
				duration: 1500,
				easingFactor: 4,
			},
			bounce = true,
			axis: { x = true, y = true } = {
				x: true,
				y: true,
			},
		}: {
			slide?: boolean;
			slideOptions?: {
				duration?: number;
				easingFactor: number;
			};
			bounce?: boolean;

			axis?: { x: boolean; y: boolean };
		} = {},
	) {
		if (!DOMelement)
			throw new Error('DOMelement not found');
		this.DOMelement = DOMelement;
		this.mouseData = {};
		this.slide = slide;
		this.animationOptions = {
			duration,
			easingFactor,
		};
		this.direction = { x, y };
		this.bounce = bounce;
		this.mouseEnterHandler =
			this.mouseEnterMethod.bind(this);
		this.mouseLeaveHandler =
			this.mouseLeaveMethod.bind(this);
		this.mouseDownHandler =
			this.mouseDownMethod.bind(this);
		this.mouseUpHandler = this.mouseUpMethod.bind(this);
		this.mouseMoveHandler =
			this.mouseMoveMethod.bind(this);
		this.DOMelement.addEventListener(
			'mouseenter',
			this.mouseEnterHandler,
		);
		this.DOMelement.addEventListener(
			'mouseleave',
			this.mouseLeaveHandler,
		);
	}

	mouseEnterMethod(): void {
		document.addEventListener(
			'mousedown',
			this.mouseDownHandler,
		);
	}

	mouseLeaveMethod(): void {
		document.removeEventListener(
			'mousedown',
			this.mouseDownHandler,
		);
	}

	mouseDownMethod(event: MouseEvent): void {
		event.preventDefault();
		this.stopSlideAnimation();
		this.setMouseDownData(event, Date.now());
		document.addEventListener(
			'mouseup',
			this.mouseUpHandler,
		);
		document.addEventListener(
			'mousemove',
			this.mouseMoveHandler,
		);
	}

	setMouseDownData(
		{ pageX: x, pageY: y }: MouseEvent,
		timestamp: number,
	): void {
		this.mouseData.mouseDown = {
			timestamp,
			position: {
				x,
				y,
			},
		};
	}

	mouseMoveMethod(event: MouseEvent): void {
		this.drag(this.setMouseMoveData(event, Date.now()));
	}

	setMouseMoveData(
		{ pageX, pageY }: MouseEvent,
		timestamp: number,
	): {
		present: StampedPosition;
		last: StampedPosition;
	} {
		if (!isStampedPosition(this.mouseData.mouseDown))
			throw new Error('mouseDown is undefined');
		const last = isStampedPosition(
			this.mouseData.mouseMove?.present,
		)
			? this.mouseData.mouseMove.present
			: this.mouseData.mouseDown;
		const present: StampedPosition = {
			position: {
				x: pageX,
				y: pageY,
			},
			timestamp,
		};
		return (this.mouseData.mouseMove = {
			last,
			present,
		});
	}

	drag({
		present,
		last,
	}: {
		present: StampedPosition;
		last: StampedPosition;
	}): void {
		const distanceX: number =
			present.position.x - last.position.x;
		const distanceY: number =
			present.position.y - last.position.y;
		this.translate({ distanceX, distanceY });
	}

	mouseUpMethod(event: MouseEvent): void {
		event.preventDefault();
		if (this.slide && this.setReleaseVelocity())
			this.startAnimateSlide();
		this.mouseData = {};
		document.removeEventListener(
			'mouseup',
			this.mouseUpHandler,
		);
		document.removeEventListener(
			'mousemove',
			this.mouseMoveHandler,
		);
	}

	setReleaseVelocity(): boolean {
		if (this.mouseData.mouseMove === undefined)
			return false;

		const { present, last } = this.mouseData.mouseMove;

		const timeDif = present.timestamp - last.timestamp;

		const deltaX = present.position.x - last.position.x;
		const deltaY = present.position.y - last.position.y;

		const distance = Math.sqrt(
			Math.pow(deltaX, 2) + Math.pow(deltaY, 2),
		);

		let speed = Math.min(distance / timeDif, 10);
		if (speed <= 0.2) return false;

		this.velocity = {
			speed,
			angle: Math.atan2(deltaY, deltaX),
		};
		return true;
	}

	startAnimateSlide() {
		this.slideAnimation = {
			rafID: requestAnimationFrame(
				this.animateSlide.bind(this),
			),
			timestamp: Date.now(),
			startTimestamp: Date.now(),
		};
	}

	animateSlide(): void {
		if (
			this.velocity === undefined ||
			this.slideAnimation === undefined
		)
			return;

		const timestamp = Date.now();

		const timeDifStart =
			timestamp - this.slideAnimation.startTimestamp;

		if (timeDifStart < this.animationOptions.duration) {
			const timeDifLastFrame =
				timestamp - this.slideAnimation.timestamp;

			const progress =
				(timeDifStart - timeDifLastFrame / 2) /
				this.animationOptions.duration;

			const easing = this.easeOutProgress(progress);

			const { speed, angle } = this.velocity;

			const easedSpeedByFrameDuration =
				speed * easing * timeDifLastFrame;

			const distanceX =
				Math.cos(angle) * easedSpeedByFrameDuration;
			const distanceY =
				Math.sin(angle) * easedSpeedByFrameDuration;

			this.translate({
				distanceX,
				distanceY,
			});
			this.slideAnimation.timestamp = timestamp;
			this.slideAnimation.rafID =
				requestAnimationFrame(
					this.animateSlide.bind(this),
				);
		} else {
			this.stopSlideAnimation();
		}
	}

	easeOutProgress(progress: number) {
		return Math.pow(
			1 - progress,
			this.animationOptions.easingFactor,
		);
	}

	stopSlideAnimation(): void {
		if (this.slideAnimation !== undefined)
			cancelAnimationFrame(this.slideAnimation.rafID);
		this.slideAnimation = undefined;
		this.translatePosition = undefined;
	}

	translate({
		distanceX = 0,
		distanceY = 0,
	}: {
		distanceX?: number;
		distanceY?: number;
	} = {}): void {
		if (this.translatePosition === undefined)
			this.translatePosition =
				this.getCurrentTranslate();
		if (this.direction.x)
			this.translatePosition.x += distanceX;
		if (this.direction.y)
			this.translatePosition.y += distanceY;
		if (this.direction.x || this.direction.y)
			this.DOMelement.style.transform = `translate(${this.translatePosition.x}px, ${this.translatePosition.y}px)`;
	}

	getCurrentTranslate(): { x: number; y: number } {
		let currentTranslateX = 0;
		let currentTranslateY = 0;
		const computedStyle = window.getComputedStyle(
			this.DOMelement,
		);
		const transform = computedStyle.transform;
		if (transform && transform !== 'none') {
			const matrix = transform
				.replace(/[^0-9\-.,]/g, '')
				.split(',');
			currentTranslateX = parseInt(
				matrix[12] || matrix[4],
				10,
			);
			currentTranslateY = parseInt(
				matrix[13] || matrix[5],
				10,
			);
		}
		return {
			x: currentTranslateX,
			y: currentTranslateY,
		};
	}

	resetTranslate(): void {
		const currentTranslate = this.getCurrentTranslate();
		if (
			currentTranslate.x === 0 &&
			currentTranslate.y === 0
		)
			return;
		this.DOMelement.style.transition =
			'all 0.2s ease-out';
		this.DOMelement.style.transform =
			'translate(0px, 0px)';
		this.DOMelement.addEventListener(
			'transitionend',
			() => {
				this.DOMelement.style.transition = '';
			},
		);
	}
}
