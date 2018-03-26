import { ElementGroup, Layout } from '../';

export class Columns extends ElementGroup {
   explicitLayout(layout: Layout) {
      // add page number if given
      if (this.number > 0) {
         this.addText(this.number, 'pageNumber');
      }
      super.explicitLayout(layout);
   }
}

module.exports = Columns;
