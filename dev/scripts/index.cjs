"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/index.ts
function isStampedPosition(data) {
  return (data == null ? void 0 : data.timestamp) !== void 0 && (data == null ? void 0 : data.position.x) !== void 0 && (data == null ? void 0 : data.position.y) !== void 0 && typeof data.timestamp === "number" && typeof data.position.x === "number" && typeof data.position.y === "number";
}
var Dragable = class {
  constructor(DOMelement, {
    slide = true,
    slideOptions: {
      duration = 1500,
      easingFactor = 4
    } = {
      duration: 1500,
      easingFactor: 4
    },
    bounce = true,
    axis: { x = true, y = true } = {
      x: true,
      y: true
    }
  } = {}) {
    if (!DOMelement)
      throw new Error("DOMelement not found");
    this.DOMelement = DOMelement;
    this.mouseData = {};
    this.slide = slide;
    this.animationOptions = {
      duration,
      easingFactor
    };
    this.direction = { x, y };
    this.bounce = bounce;
    this.mouseEnterHandler = this.mouseEnterMethod.bind(this);
    this.mouseLeaveHandler = this.mouseLeaveMethod.bind(this);
    this.mouseDownHandler = this.mouseDownMethod.bind(this);
    this.mouseUpHandler = this.mouseUpMethod.bind(this);
    this.mouseMoveHandler = this.mouseMoveMethod.bind(this);
    this.DOMelement.addEventListener(
      "mouseenter",
      this.mouseEnterHandler
    );
    this.DOMelement.addEventListener(
      "mouseleave",
      this.mouseLeaveHandler
    );
  }
  mouseEnterMethod() {
    document.addEventListener(
      "mousedown",
      this.mouseDownHandler
    );
  }
  mouseLeaveMethod() {
    document.removeEventListener(
      "mousedown",
      this.mouseDownHandler
    );
  }
  mouseDownMethod(event) {
    event.preventDefault();
    this.stopSlideAnimation();
    this.setMouseDownData(event, Date.now());
    document.addEventListener(
      "mouseup",
      this.mouseUpHandler
    );
    document.addEventListener(
      "mousemove",
      this.mouseMoveHandler
    );
  }
  setMouseDownData({ pageX: x, pageY: y }, timestamp) {
    this.mouseData.mouseDown = {
      timestamp,
      position: {
        x,
        y
      }
    };
  }
  mouseMoveMethod(event) {
    this.drag(this.setMouseMoveData(event, Date.now()));
  }
  setMouseMoveData({ pageX, pageY }, timestamp) {
    var _a;
    if (!isStampedPosition(this.mouseData.mouseDown))
      throw new Error("mouseDown is undefined");
    const last = isStampedPosition(
      (_a = this.mouseData.mouseMove) == null ? void 0 : _a.present
    ) ? this.mouseData.mouseMove.present : this.mouseData.mouseDown;
    const present = {
      position: {
        x: pageX,
        y: pageY
      },
      timestamp
    };
    return this.mouseData.mouseMove = {
      last,
      present
    };
  }
  drag({
    present,
    last
  }) {
    const distanceX = present.position.x - last.position.x;
    const distanceY = present.position.y - last.position.y;
    this.translate({ distanceX, distanceY });
  }
  mouseUpMethod(event) {
    event.preventDefault();
    if (this.slide && this.setReleaseVelocity())
      this.startAnimateSlide();
    this.mouseData = {};
    document.removeEventListener(
      "mouseup",
      this.mouseUpHandler
    );
    document.removeEventListener(
      "mousemove",
      this.mouseMoveHandler
    );
  }
  setReleaseVelocity() {
    if (this.mouseData.mouseMove === void 0)
      return false;
    const { present, last } = this.mouseData.mouseMove;
    const timeDif = present.timestamp - last.timestamp;
    const deltaX = present.position.x - last.position.x;
    const deltaY = present.position.y - last.position.y;
    const distance = Math.sqrt(
      Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
    );
    let speed = Math.min(distance / timeDif, 10);
    if (speed <= 0.2)
      return false;
    this.velocity = {
      speed,
      angle: Math.atan2(deltaY, deltaX)
    };
    return true;
  }
  startAnimateSlide() {
    this.slideAnimation = {
      rafID: requestAnimationFrame(
        this.animateSlide.bind(this)
      ),
      timestamp: Date.now(),
      startTimestamp: Date.now()
    };
  }
  animateSlide() {
    if (this.velocity === void 0 || this.slideAnimation === void 0)
      return;
    const timestamp = Date.now();
    const timeDifStart = timestamp - this.slideAnimation.startTimestamp;
    if (timeDifStart < this.animationOptions.duration) {
      const timeDifLastFrame = timestamp - this.slideAnimation.timestamp;
      const progress = (timeDifStart - timeDifLastFrame / 2) / this.animationOptions.duration;
      const easing = this.easeOutProgress(progress);
      const { speed, angle } = this.velocity;
      const easedSpeedByFrameDuration = speed * easing * timeDifLastFrame;
      const distanceX = Math.cos(angle) * easedSpeedByFrameDuration;
      const distanceY = Math.sin(angle) * easedSpeedByFrameDuration;
      this.translate({
        distanceX,
        distanceY
      });
      this.slideAnimation.timestamp = timestamp;
      this.slideAnimation.rafID = requestAnimationFrame(
        this.animateSlide.bind(this)
      );
    } else {
      this.stopSlideAnimation();
    }
  }
  easeOutProgress(progress) {
    return Math.pow(
      1 - progress,
      this.animationOptions.easingFactor
    );
  }
  stopSlideAnimation() {
    if (this.slideAnimation !== void 0)
      cancelAnimationFrame(this.slideAnimation.rafID);
    this.slideAnimation = void 0;
    this.translatePosition = void 0;
  }
  translate({
    distanceX = 0,
    distanceY = 0
  } = {}) {
    if (this.translatePosition === void 0)
      this.translatePosition = this.getCurrentTranslate();
    if (this.direction.x)
      this.translatePosition.x += distanceX;
    if (this.direction.y)
      this.translatePosition.y += distanceY;
    if (this.direction.x || this.direction.y)
      this.DOMelement.style.transform = `translate(${this.translatePosition.x}px, ${this.translatePosition.y}px)`;
  }
  getCurrentTranslate() {
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    const computedStyle = window.getComputedStyle(
      this.DOMelement
    );
    const transform = computedStyle.transform;
    if (transform && transform !== "none") {
      const matrix = transform.replace(/[^0-9\-.,]/g, "").split(",");
      currentTranslateX = parseInt(
        matrix[12] || matrix[4],
        10
      );
      currentTranslateY = parseInt(
        matrix[13] || matrix[5],
        10
      );
    }
    return {
      x: currentTranslateX,
      y: currentTranslateY
    };
  }
  resetTranslate() {
    const currentTranslate = this.getCurrentTranslate();
    if (currentTranslate.x === 0 && currentTranslate.y === 0)
      return;
    this.DOMelement.style.transition = "all 0.2s ease-out";
    this.DOMelement.style.transform = "translate(0px, 0px)";
    this.DOMelement.addEventListener(
      "transitionend",
      () => {
        this.DOMelement.style.transition = "";
      }
    );
  }
};


exports.Dragable = Dragable;
//# sourceMappingURL=index.cjs.map