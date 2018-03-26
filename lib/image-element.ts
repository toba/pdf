import { is } from '@toba/tools';
import { BaseElement, AreaElement, Scale } from '../';

interface BasicImage {
   width: number;
   height: number;
}

export class ImageElement extends BaseElement {
   scaleTo: Scale;
   original: BasicImage;

   constructor(style: string) {
      super(style === undefined ? 'image' : style);
      /**
       * Original image parameters from source
       * @type TI.PhotoSize
       */
      this.original = null;
   }

   /**
    * Whether image is portrait orientation
    */
   get isPortrait() {
      return (
         this.original !== null && this.original.height > this.original.width
      );
   }

   scale(container: AreaElement) {
      switch (this.scaleTo) {
         case Scale.Fit:
            this.fit(container);
            break;
         case Scale.Fill:
            this.fill(container);
            break;
         default:
            super.scale(container);
            break;
      }
   }

   /**
    * Calculate new dimensions that fit within given boundaries
    */
   fit(container: AreaElement) {
      const w = TI.PDF.pixelsToInches(this.original.width);
      const h = TI.PDF.pixelsToInches(this.original.height);

      if (w < container.width && h < container.height) {
         // fits at full size
         this.width = w;
         this.height = h;
      } else {
         // shrink
         const widthRatio = container.width / w;
         const heightRatio = container.height / h;

         if (widthRatio < heightRatio) {
            // width needs to shrink more
            this.width = container.width;
            this.height = h * widthRatio;
            this.left = 0;
         } else {
            this.height = container.height;
            this.width = w * heightRatio;
            this.top = 0;
         }
      }
   }

   /**
    * Calculate dimensions and offsets to fill boundary
    */
   fill(container: AreaElement) {
      const w = TI.PDF.pixelsToInches(this.original.width);
      const h = TI.PDF.pixelsToInches(this.original.height);
      let ratio = 1;

      if (w < container.width || h < container.height) {
         // need to stretch
         const widthRatio = container.width / w;
         const heightRatio = container.height / h;
         // grow by ratio needing to expand most
         ratio = widthRatio > heightRatio ? widthRatio : heightRatio;
      }

      this.width = w * ratio;
      this.height = h * ratio;
      // offset to center
      this.center(container.width);
      this.top = (container.height - this.height) / 2;
   }

   /**
    * @param {TI.PDF.Layout} layout
    * @param {function} callback
    */
   render(layout, callback) {
      this.explicitLayout(layout, this.area);

      const p = this.area.pixels;

      getImage(this.original.url, buffer => {
         layout.pdf.image(buffer, p.left, p.top, {
            width: p.width,
            height: p.height
         });
         callback();
      });
   }
}

/**
 * Load image bytes
 * @param {String} url
 * @param {function(Buffer)} callback
 */
function getImage(url, callback) {
   // null encoding defaults to binary Buffer
   const options = { url: url, encoding: null };

   if (!is.empty(config.proxy)) {
      options.proxy = config.proxy;
   }

   request(options, (error, response, data) => {
      if (error !== null) {
         db.log.ERROR('%s when accessing %s', error.toString(), url);
      } else {
         callback(data);
      }
   });
}
