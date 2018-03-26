import { Style, Scale } from '../';

/**
 * Base class for printable elements
 */
export class BaseElement {
   style: Style;
   /** Right-side distance from containing area */
   right: number = NaN;
   /** Bottom distance from containing area */
   bottom: number = NaN;
   minWidth: number = NaN;
   minHeight: number = NaN;
   scaleTo = Scale.None;
   /** RGBA color */
   _color: [0, 0, 0, 1];

   zIndex: 0;

   /**
    * All dimensions in inches
    */
   constructor(style?: Style) {
      this.area = new Area();
      this.style = style;
   }

   /** @param {Number} n */
   set width(n) {
      this.area.width = n;
   }
   /** @returns {Number} */
   get width() {
      return this.area.width;
   }

   /** @param {Number} n */
   set height(n) {
      this.area.height = n;
   }
   /** @returns {Number} */
   get height() {
      return this.area.height;
   }

   /** @param {Number} n */
   set left(n) {
      this.area.left = n;
   }
   /** @returns {Number} */
   get left() {
      return this.area.left;
   }

   /** @param {Number} n */
   set top(n) {
      this.area.top = n;
   }
   /** @returns {Number} */
   get top() {
      return this.area.top;
   }

   /** @param {Number} n */
   set pageTop(n) {
      this.area.pageTop = n;
   }
   /** @returns {Number} */
   get pageTop() {
      return this.area.pageTop;
   }

   /** @param {Number} n */
   set pageLeft(n) {
      this.area.pageLeft = n;
   }
   /** @returns {Number} */
   get pageLeft() {
      return this.area.pageLeft;
   }

   /** @returns {{horizontal: string, vertical: string}} */
   get align() {
      return this.area.align;
   }

   /**
    * RGB color array
    * @returns {Number[]}
    */
   get color() {
      if (is.array(this._color)) {
         return this._color.length > 3 ? this._color.slice(0, 3) : this._color;
      } else {
         return [0, 0, 0];
      }
   }

   /**
    * RGB color array
    * @param {Number[]} c
    */
   set color(c) {
      this._color = c;
   }

   /**
    * Opacity level between 0 and 1
    * @returns {Number}
    */
   get opacity() {
      return is.array(this._color) && this._color.length > 3
         ? this._color[3]
         : 1;
   }

   /**
    * Opacity level between 0 and 1
    * @param {Number} a
    */
   set opacity(a) {
      if (is.array(this._color)) {
         this._color[3] = a;
      } else {
         this._color = [0, 0, 0, a];
      }
   }

   /**
    * Set width and height for elements with anchored opposite edges
    * Previously set width and height will be replaced
    * @param {TI.PDF.Element.Area} container
    */
   scale(container) {
      if (!isNaN(this.left) && !isNaN(this.right) && !isNaN(container.width)) {
         // adjust width to fit left and right parameters
         this.width = container.width - (this.left + this.right);
      }

      if (!isNaN(this.top) && !isNaN(this.bottom) && !isNaN(container.height)) {
         // adjust height to fit top and bottom parameters
         this.height = container.height - (this.top + this.bottom);
      }
   }

   /**
    * Apply alignment rules
    * @param {TI.PDF.Element.Area} container
    * @param {TI.PDF.Layout} [layout]
    */
   alignWithin(container, layout) {
      this.area.inherit(container);
      // populate calculable values so anything left undefined is genuinely unknown
      this.updateSizeWithin(container, layout);

      // alignments never override explicit dimensions
      switch (this.area.align.horizontal) {
         case TI.PDF.Align.Left:
            if (isNaN(this.left)) {
               this.left = 0;
            }
            break;
         case TI.PDF.Align.Right:
            if (isNaN(this.left) || isNaN(this.width)) {
               this.right = 0;
            }
            break;
         case TI.PDF.Align.Center: {
            if (!isNaN(container.width) && isNaN(this.left)) {
               this.left = (container.width - this.width) / 2;
            }
         }
      }

      switch (this.area.align.vertical) {
         case TI.PDF.Align.Top:
            if (isNaN(this.top)) {
               this.top = 0;
            }
            break;
         case TI.PDF.Align.Bottom:
            if (isNaN(this.top) || isNaN(this.height)) {
               this.bottom = 0;
            }
            break;
         case TI.PDF.Align.Center: {
            if (!isNaN(container.height) && isNaN(this.top)) {
               this.top = (container.height - this.height) / 2;
            }
         }
      }

      this.updateSizeWithin(container, layout);

      if (!isNaN(this.bottom) && !isNaN(this.height) && isNaN(this.top)) {
         // bottom and height are given but not top -- position relative to bottom
         this.top = container.height - (this.height + this.bottom);
      }

      if (!isNaN(this.right) && !isNaN(this.width) && isNaN(this.left)) {
         // right and width are given but not left -- position relative to right
         this.left = container.width - (this.width + this.right);
      }
   }

   /**
    * @param {TI.PDF.Element.Area} container
    */
   offsetWithin(container) {
      this.area.add(container);
   }

   /**
    * Apply style rules, add parent dimensions and calculate missing values
    * @param {TI.PDF.Layout} layout
    * @param {TI.PDF.Element.Area} [container] Container area
    */
   explicitLayout(layout, container) {
      layout.applyTo(this);

      if (container !== undefined) {
         this.scale(container);
         this.alignWithin(container, layout);
         this.offsetWithin(container);
      }
   }

   /**
    * Calculate missing area values
    * @param {TI.PDF.Element.Area} [container]
    */
   implicitLayout(container) {
      if (is.value(container)) {
         //if (this.area.isEmpty) { this.area.copy(area); }
         //this.area.add(container);
      }
   }

   /**
    * @param {TI.PDF.Layout} layout
    * @param {function} [callback]
    */
   render(layout, callback) {
      this.explicitLayout(layout);
   }

   /**
    * Top offset in pixels
    * @returns {Number}
    */
   get topPixels() {
      return TI.PDF.inchesToPixels(this.top);
   }

   /**
    * Left offset pixels
    * @returns {Number}
    */
   get leftPixels() {
      return TI.PDF.inchesToPixels(this.left);
   }

   /**
    * Width in pixels
    * @returns {Number}
    */
   get widthPixels() {
      return TI.PDF.inchesToPixels(this.width);
   }

   /**
    * Set width in pixels
    * @param {Number} p
    */
   set widthPixels(p) {
      this.width = TI.PDF.pixelsToInches(p);
   }

   /**
    * Height in pixels
    * @alias TI.PDF.Element.Base.heightPixels
    * @returns {Number}
    */
   get heightPixels() {
      return TI.PDF.inchesToPixels(this.height);
   }

   /**
    * Set height in pixels
    * @param {Number} p
    */
   set heightPixels(p) {
      this.height = TI.PDF.pixelsToInches(p);
   }

   /**
    * Calculate left offset to center within width
    * @param {Number} [width]
    */
   horizontalCenter(width) {
      if (isNaN(this.width)) {
         this.align.horizontal = TI.PDF.Align.Center;
      } else {
         this.left = (width - this.width) / 2;
      }
   }

   /**
    * Calculate top and left if other values are known
    * @param {TI.PDF.Element.Area} container
    * @param {TI.PDF.Layout} [layout] Optionally use PDF in layout to calculate text sizes
    */
   updateSizeWithin(container, layout) {
      this.area.calculate(container, this.bottom, this.right);
   }
}

ElementBase.prototype.center = ElementBase.prototype.horizontalCenter;

module.exports = ElementBase;
