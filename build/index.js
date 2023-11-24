function isStampedPosition(data) {
    return ((data === null || data === void 0 ? void 0 : data.timestamp) !== undefined &&
        (data === null || data === void 0 ? void 0 : data.position.x) !== undefined &&
        (data === null || data === void 0 ? void 0 : data.position.y) !== undefined &&
        typeof data.timestamp === 'number' &&
        typeof data.position.x === 'number' &&
        typeof data.position.y === 'number');
}
var Dragable = /** @class */ (function () {
    function Dragable(DOMelement, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.slide, slide = _c === void 0 ? true : _c, _d = _b.slideOptions, _e = _d === void 0 ? {
            duration: 1500,
            easingFactor: 4,
        } : _d, _f = _e.duration, duration = _f === void 0 ? 1500 : _f, _g = _e.easingFactor, easingFactor = _g === void 0 ? 4 : _g, _h = _b.bounce, bounce = _h === void 0 ? true : _h, _j = _b.axis, _k = _j === void 0 ? {
            x: true,
            y: true,
        } : _j, _l = _k.x, x = _l === void 0 ? true : _l, _m = _k.y, y = _m === void 0 ? true : _m;
        if (!DOMelement)
            throw new Error('DOMelement not found');
        this.DOMelement = DOMelement;
        this.mouseData = {};
        this.slide = slide;
        this.animationOptions = {
            duration: duration,
            easingFactor: easingFactor,
        };
        this.direction = { x: x, y: y };
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
        this.DOMelement.addEventListener('mouseenter', this.mouseEnterHandler);
        this.DOMelement.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
    Dragable.prototype.mouseEnterMethod = function () {
        document.addEventListener('mousedown', this.mouseDownHandler);
    };
    Dragable.prototype.mouseLeaveMethod = function () {
        document.removeEventListener('mousedown', this.mouseDownHandler);
    };
    Dragable.prototype.mouseDownMethod = function (event) {
        event.preventDefault();
        this.stopSlideAnimation();
        this.setMouseDownData(event, Date.now());
        document.addEventListener('mouseup', this.mouseUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    };
    Dragable.prototype.setMouseDownData = function (_a, timestamp) {
        var x = _a.pageX, y = _a.pageY;
        this.mouseData.mouseDown = {
            timestamp: timestamp,
            position: {
                x: x,
                y: y,
            },
        };
    };
    Dragable.prototype.mouseMoveMethod = function (event) {
        this.drag(this.setMouseMoveData(event, Date.now()));
    };
    Dragable.prototype.setMouseMoveData = function (_a, timestamp) {
        var _b;
        var pageX = _a.pageX, pageY = _a.pageY;
        if (!isStampedPosition(this.mouseData.mouseDown))
            throw new Error('mouseDown is undefined');
        var last = isStampedPosition((_b = this.mouseData.mouseMove) === null || _b === void 0 ? void 0 : _b.present)
            ? this.mouseData.mouseMove.present
            : this.mouseData.mouseDown;
        var present = {
            position: {
                x: pageX,
                y: pageY,
            },
            timestamp: timestamp,
        };
        return (this.mouseData.mouseMove = {
            last: last,
            present: present,
        });
    };
    Dragable.prototype.drag = function (_a) {
        var present = _a.present, last = _a.last;
        var distanceX = present.position.x - last.position.x;
        var distanceY = present.position.y - last.position.y;
        this.translate({ distanceX: distanceX, distanceY: distanceY });
    };
    Dragable.prototype.mouseUpMethod = function (event) {
        event.preventDefault();
        if (this.slide && this.setReleaseVelocity())
            this.startAnimateSlide();
        this.mouseData = {};
        document.removeEventListener('mouseup', this.mouseUpHandler);
        document.removeEventListener('mousemove', this.mouseMoveHandler);
    };
    Dragable.prototype.setReleaseVelocity = function () {
        if (this.mouseData.mouseMove === undefined)
            return false;
        var _a = this.mouseData.mouseMove, present = _a.present, last = _a.last;
        var timeDif = present.timestamp - last.timestamp;
        var deltaX = present.position.x - last.position.x;
        var deltaY = present.position.y - last.position.y;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        var speed = Math.min(distance / timeDif, 3);
        if (speed <= 0.2)
            return false;
        this.velocity = {
            speed: speed,
            angle: Math.atan2(deltaY, deltaX),
        };
        return true;
    };
    Dragable.prototype.startAnimateSlide = function () {
        this.slideAnimation = {
            rafID: requestAnimationFrame(this.animateSlide.bind(this)),
            timestamp: Date.now(),
            startTimestamp: Date.now(),
        };
    };
    Dragable.prototype.animateSlide = function () {
        if (this.velocity === undefined ||
            this.slideAnimation === undefined)
            return;
        var timestamp = Date.now();
        var timeDifStart = timestamp - this.slideAnimation.startTimestamp;
        if (timeDifStart < this.animationOptions.duration) {
            var timeDifLastFrame = timestamp - this.slideAnimation.timestamp;
            var progress = (timeDifStart - timeDifLastFrame / 2) /
                this.animationOptions.duration;
            var easing = this.easeOutProgress(progress);
            var _a = this.velocity, speed = _a.speed, angle = _a.angle;
            var easedSpeedByFrameDuration = speed * easing * timeDifLastFrame;
            var distanceX = Math.cos(angle) * easedSpeedByFrameDuration;
            var distanceY = Math.sin(angle) * easedSpeedByFrameDuration;
            this.translate({
                distanceX: distanceX,
                distanceY: distanceY,
            });
            this.slideAnimation.timestamp = timestamp;
            this.slideAnimation.rafID =
                requestAnimationFrame(this.animateSlide.bind(this));
        }
        else {
            this.stopSlideAnimation();
        }
    };
    Dragable.prototype.easeOutProgress = function (progress) {
        return Math.pow(1 - progress, this.animationOptions.easingFactor);
    };
    Dragable.prototype.stopSlideAnimation = function () {
        if (this.slideAnimation !== undefined)
            cancelAnimationFrame(this.slideAnimation.rafID);
        this.slideAnimation = undefined;
        this.translatePosition = undefined;
    };
    Dragable.prototype.translate = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.distanceX, distanceX = _c === void 0 ? 0 : _c, _d = _b.distanceY, distanceY = _d === void 0 ? 0 : _d;
        if (this.translatePosition === undefined)
            this.translatePosition =
                this.getCurrentTranslate();
        if (this.direction.x)
            this.translatePosition.x += distanceX;
        if (this.direction.y)
            this.translatePosition.y += distanceY;
        if (this.direction.x || this.direction.y)
            this.DOMelement.style.transform = "translate(".concat(this.translatePosition.x, "px, ").concat(this.translatePosition.y, "px)");
    };
    Dragable.prototype.getCurrentTranslate = function () {
        var currentTranslateX = 0;
        var currentTranslateY = 0;
        var computedStyle = window.getComputedStyle(this.DOMelement);
        var transform = computedStyle.transform;
        if (transform && transform !== 'none') {
            var matrix = transform
                .replace(/[^0-9\-.,]/g, '')
                .split(',');
            currentTranslateX = parseInt(matrix[12] || matrix[4], 10);
            currentTranslateY = parseInt(matrix[13] || matrix[5], 10);
        }
        return {
            x: currentTranslateX,
            y: currentTranslateY,
        };
    };
    Dragable.prototype.resetTranslate = function () {
        var _this = this;
        var currentTranslate = this.getCurrentTranslate();
        if (currentTranslate.x === 0 &&
            currentTranslate.y === 0)
            return;
        this.DOMelement.style.transition =
            'all 0.2s ease-out';
        this.DOMelement.style.transform =
            'translate(0px, 0px)';
        this.DOMelement.addEventListener('transitionend', function () {
            _this.DOMelement.style.transition = '';
        });
    };
    return Dragable;
}());
//# sourceMappingURL=index.js.map