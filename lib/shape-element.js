'use strict';

const TI = require('../../');
const ElementBase = TI.PDF.Element.Base;

/**
 * @namespace TI.PDF.Element.Shape
 * @extends ElementBase
 */
class ShapeElement extends ElementBase {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'shape' : style);

		/**
		 * @type String
		 */
		this.borderColor = '#000';
		/**
		 * @type Number
		 */
		this.borderWidth = 0;
		/**
		 * @type Number
		 */
		this.opacity = 1;
	}
}

module.exports = ShapeElement;