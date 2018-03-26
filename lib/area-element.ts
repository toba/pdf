import { BaseElement, Align } from '../';

export class AreaElement extends BaseElement {
   with: number = NaN;
   height: number = NaN;
   /** Left edge distance from containing element */
   private left: number = NaN;
   /** Top edge distance from containing element */
   private top: number = NaN;
   /** Top edge distance from page */
   private _pageTop: number = NaN;
   /** Left edge distance from page */
   private _pageLeft: number = NaN;
   /** Whether measurements are in pixels (as opposed to inches) */
   isPixels = false;

   /**
    * Content alignment
    */
   align = {
      horizontal: Align.Inherit,
      vertical: Align.Inherit
   };


   /**
    * Whether width, height left and top are all empty
    */
   get isEmpty() {
      return (
         isNaN(this.width) &&
         isNaN(this.height) &&
         isNaN(this.left) &&
         isNaN(this.top)
      );
   }

   /**
    * Overall distance from page top.
    */
   get pageTop(): number {
      if (isNaN(this._pageTop)) {
         this._pageTop = this.top;
      }
      return this._pageTop;
   }

   set pageTop(n: number) {
      this._pageTop = n;
   }

   /**
    * Overall distance from page left.
    */
   get pageLeft(): number {
      if (isNaN(this._pageLeft)) {
         this._pageLeft = this.left;
      }
      return this._pageLeft;
   }

   set pageLeft(n: number) {
      this._pageLeft = n;
   }

   /**
    * Convert element area to pixels
    * @returns {ElementArea|TI.PDF.Element.Area}
    */
   get pixels() {
      if (this.isPixels) {
         return this;
      } else {
         const a = new AreaElement();
         a.relativeLeft = TI.PDF.inchesToPixels(this._relativeLeft);
         a.relativeTop = TI.PDF.inchesToPixels(this._relativeTop);
         a.top = TI.PDF.inchesToPixels(this.top);
         a.left = TI.PDF.inchesToPixels(this.left);
         a.width = TI.PDF.inchesToPixels(this.width);
         a.height = TI.PDF.inchesToPixels(this.height);
         a.isPixels = true;

         return a;
      }
   }

   /**
    * Convert element area to inches
    */
   get inches(): AreaElement {
      if (this.isPixels) {
         const a = new ElementArea();
         a.relativeLeft = TI.PDF.pixelsToInches(this._relativeLeft);
         a.relativeTop = TI.PDF.pixelsToInches(this._relativeTop);
         a.top = TI.PDF.pixelsToInches(this.top);
         a.left = TI.PDF.pixelsToInches(this.left);
         a.width = TI.PDF.pixelsToInches(this.width);
         a.height = TI.PDF.pixelsToInches(this.height);
         a.isPixels = false;

         return a;
      } else {
         return this;
      }
   }

   /**
    * Offset to copy values to (created if none given)
    */
   copy(a: AreaElement) {
      if (a === undefined) {
         a = new AreaElement();
      }
      a.pageLeft = this._pageLeft;
      a.pageTop = this._pageTop;
      a.width = this.width;
      a.height = this.height;
      a.left = this.left;
      a.top = this.top;
      a.isPixels = this.isPixels;
      a.align.horizontal = this.align.horizontal;
      a.align.vertical = this.align.vertical;
      return a;
   }

   /**
    * Add page offsets
    * If this area hasn't defined those dimensions then they are set equal to
    * the container values
    * @alias TI.PDF.Element.Area.add
    * @param {ElementArea|TI.PDF.Element.Area} other Container area
    * @returns {ElementArea|TI.PDF.Element.Area}
    */
   add(other); {
      const l = other.pageLeft;
      const t = other.pageTop;

      if (!isNaN(l)) {
         // continer has left dimension
         const d = this.pageLeft;
         this.pageLeft = isNaN(d) ? l : d + l;
      }
      if (!isNaN(t)) {
         // container has top dimension
         const d = this.pageTop;
         this.pageTop = isNaN(d) ? t : d + t;
      }
      return this;
   }

   /**
    * Inherit alignment from another area
    * @param {TI.PDF.Element.Area} other
    */
   inherit(other); {
      const h = TI.PDF.Align.Inherit;

      if (this.align.horizontal === h && other.align.horizontal !== h) {
         this.align.horizontal = other.align.horizontal;
      }

      if (this.align.vertical === h && other.align.vertical !== h) {
         this.align.vertical = other.align.vertical;
      }
   }

   /**
    * Compute missing values
    * @param {TI.PDF.Element.Area} container
    * @param {Number} bottom Bottom distance from container edge
    * @param {Number} right Right distance from container edge
    */
   calculate(container, bottom, right); {
      if (!isNaN(right) && !isNaN(container.width)) {
         // convert distance from right into distance from left
         const rightLength = container.width - right;

         if (isNaN(this.left) && !isNaN(this.width)) {
            this.left = rightLength - this.width;
         } else if (isNaN(this.width) && !isNaN(this.left)) {
            this.width = rightLength - this.left;
         }
      }

      if (!isNaN(bottom) && !isNaN(container.height)) {
         // convert distance from bottom into distance from top
         const bottomLength = container.height - bottom;

         if (isNaN(this.top) && !isNaN(this.height)) {
            this.top = bottomLength - this.height;
         } else if (isNaN(this.height) && !isNaN(this.top)) {
            this.height - bottomLength - this.top;
         }
      }
   }

   /**
    * Remove all measurements
    * @returns {ElementArea|TI.PDF.Element.Area}
    */
   reset(); {
      this.width = NaN;
      this.height = NaN;
      this.left = NaN;
      this.top = NaN;
      this._pageTop = NaN;
      this._pageLeft = NaN;

      this.align.horizontal = TI.PDF.Align.Inherit;
      this.align.vertical = TI.PDF.Align.Inherit;

      return this;
   }

   /**
    * Whether this area overlaps another
    * @param {ElementArea|TI.PDF.Element.Area} area
    * @returns {Boolean}
    */
   overlaps(area); {
      return (
         area.left < this.left + this.width && area.top < this.top + this.height
      );
   }
}

module.exports = ElementArea;
