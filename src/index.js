
var DomEmitter = require('dom-emitter')
  , position = require('position')
  , container = position.container
  , viewPort = require('viewport')
  , classes = require('classes')
  , tmpl = require('./template')
  , domify = require('domify')
  , css = require('css')

module.exports = Satellite

/**
 * Initialize a `Satellite` with the given `content`.
 *
 *   new Satellite('moon')
 * 
 * @param {Mixed} content
 * @api public
 */

function Satellite (content) {
	this.view = domify(tmpl)
	this.events = new DomEmitter(this.view, this)
	this.classList = classes(this.view)
	if (content != null) this.view.innerHTML = content
	if (Satellite.effect) this.effect(Satellite.effect)
	this.prefer('north')
	this.appendTo(document.body)
}

/**
 * Insert content into the satellite's body
 * 
 * @param {String|Element} content
 * @return {Self}
 */


Satellite.prototype.append = function (content) {
	if (typeof content == 'string') {
		content = domify(content)
	}
	this.view.appendChild(content)
	return this
}

/**
 * Attach to the given `el` with optional hide `delay`.
 *
 * @param {Element} el
 * @param {Number} delay
 * @return {Self}
 * @api public
 */

Satellite.prototype.attach = function(el, delay){
	this.orbit(el)
	this._targetEvents = new DomEmitter(el, this)
		.on('mouseover', function(){
			this.show()
			this.cancelHide()
		})
		.on('mouseout', function(){
			this.hide(delay)
		})
	return this
}

/**
 * Insert the satellite as a child
 * 
 * @param {Element} element which will be the satellite's parent
 * @return {Self}
 */

Satellite.prototype.appendTo = function (el) {
	el.appendChild(this.view)
	this.cache()
	return this
}

/**
 * Update the cached size of the current containing node and the Satellite element
 * 
 * @return {Self}
 * @api private
 */

Satellite.prototype.cache = function () {
	this._container = container(this.view)
	this.width = this.view.offsetWidth
	this.height = this.view.offsetHeight
}

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @return {Self}
 * @api public
 */

Satellite.prototype.cancelHideOnHover = function(delay){
	this.events.on('mouseover', 'cancelHide')
	this.events.on('mouseout', function () {
		this.hide(delay)
	})
	return this
}

/**
 * Get current effect or set the effect to `type`.
 *
 *  - `fade`
 *
 * @param {String} [type]
 * @return {this}
 */

Satellite.prototype.effect = function(type){
	if (type == null) return this._effect
	if (this._effect) this.classList.remove(this._effect)
	this.classList.add(this._effect = type)
	return this
}

/**
 * Set position preference:
 *
 *  - `north`
 *  - `north east`
 *  - `north west`
 *  - `south`
 *  - `south east`
 *  - `south west`
 *  - `east`
 *  - `west`
 *
 * @param {String} type
 * @return {Self}
 */

Satellite.prototype.prefer = function(type){
	var types = (type).match(/(south|north)?\s*(east|west)?/)
	if (!types) throw new Error('Invalid position type')
	this._preference = type
	this._vertical = types[1] || ''
	this._horizontal = types[2] || ''
	setClass(this, type)
	return this
}

/**
 * Calculate or set the target area
 *
 * To target an element:
 *   var target = document.querySelector('#target')
 *   satellite.orbit(target)
 *   
 * To specify an explit target area:
 *   satellite.orbit(target.getBoundingClientRects())
 *   
 * To specify a point:
 *   satellite.orbit(100, 100)
 * 
 * @param  {Object|Element|Number} x
 * @param {Number} [y] if x is a number y should also be specified
 * @return {Self}
 */

Satellite.prototype.orbit = function (x, y) {
	var box
	delete this._target
	if (y == null) {
		if (x instanceof Element) {
			this._target = x
			box = position(x)
		} else {
			// Is an object
			box = x
		}
	} else {
		// Is an explicit cord
		box = {
			left: x,
			right: x,
			top: y,
			bottom: y
		}
	}
	box.midX = (box.left + box.right) / 2
	box.midY = (box.top + box.bottom) / 2
	this._targetBox = box
	return this
}

/**
 * Show the Satellite attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @return {Self}
 */

Satellite.prototype.show = function () {
	this.classList.remove('satellite-hide')

	viewPort.on('resize', this.onResize, this)
	viewPort.on('scroll', this.reposition, this)
	// Call resize incase something changed while the Satellite was hidden
	this.onResize()
	this.events.emit('show')
	return this
}

/**
 * Handler for resize events
 * @api private
 */

Satellite.prototype.onResize = function (e) {
	// Target node might of changed size
	if (this._target) this.orbit(this._target)
	// as might its container
	this.cache()
	this.reposition()
}

/**
 * Apply the position
 *
 * @api private
 */

Satellite.prototype.reposition = function(){
	// Default all properties to auto
	var style = {left:'auto', top:'auto', right:'auto', bottom: 'auto'}
	var offset = this.suggest()
	// Ensure the correct position class is applied
	if (offset.suggestion !== this._preference) setClass(this, offset.suggestion)

	// Base positioning on the bottom edge so if content grows it positioning is still correct
	// if (this._vertical === 'north') css.bottom = document.body.offsetHeight - off.bottom
	style.top = offset.top - this._container.top
	// Base positioning on the right edge so if content grows it positioning is still correct
	// if (this._horizontal === 'east') css.right = document.body.offsetWidth - off.right
	style.left = offset.left - this._container.left

	css(this.view, style)
}

/**
 * Compute the optimal positioning so as to maximise the area of the satellite
 * shown on screen while respecting the prefered location if there is enough room
 *
 * @return {Object} {top, left, bottom, right, suggestion}
 * @api private
 */

Satellite.prototype.suggest = function(){
	var top = viewPort.top
	  , left = viewPort.left
	  , right = viewPort.right
	  , bottom = viewPort.bottom
	  , target = this._targetBox
	  , offset = calcPosition(this, this._preference)
	  , y, x, suggestion
	// too high or too low...
	if (offset.top < top || offset.bottom > bottom) {
		// ...go where there is more room
		if (bottom - target.bottom > target.top - top)
			y = 'south'
		else 
			y = 'north'
	}
	// too far to the right or left...
	if (offset.right > right || offset.left < left) {
		// ...go where there is more room
		if (right - target.right > target.left - left)
			x = 'east'
		else
			x = 'west'
	}
	suggestion = ((y || this._vertical) + ' ' + (x || this._horizontal)).trim()
	if (suggestion !== this._preference) offset = calcPosition(this, suggestion)
	offset.suggestion = suggestion
	return offset
}

/**
 * Replace position class
 *
 * @param {Satellite} sat instance 
 * @param {String} pos
 * @api private
 */

function setClass (sat, pos) {
	sat.classList
		.remove(sat._posClass)
		.add(sat._posClass = 'satellite-' + pos.split(' ').join('-'))
}

/**
 * Compute the screen location to render the Satellite
 * based on the given `pos`.
 *
 * @param {Satellite} self an instance
 * @param {String} pos
 * @return {Object}
 * @api private
 */

function calcPosition (self, pos){
	var target = self._targetBox
	switch (pos) {
		case 'north':
			return {
				top: target.top - self.height,
				right: target.midX + self.width / 2,
				bottom: target.top,
				left: target.midX - self.width / 2
			}
		case 'north west':
			return {
				top: target.top,
				right: target.left,
				bottom: target.top + self.height,
				left: target.left - self.width
			}
		case 'north east':
			return {
				top: target.top,
				right: target.right + self.width,
				bottom: target.top + self.height,
				left: target.right
			}
		case 'south':
			return {
				top: target.bottom,
				right: target.midX + self.width / 2,
				bottom: target.bottom + self.height,
				left: target.midX - self.width / 2
			}
		case 'south west':
			return {
				top: target.bottom - self.height,
				right: target.left,
				bottom: target.bottom,
				left: target.left - self.width
			}
		case 'south east':
			return {
				top: target.bottom - self.height,
				right: target.right + self.width,
				bottom: target.bottom,
				left: target.right
			}
		case 'east':
			return {
				top: target.midY - self.height / 2,
				right: target.right + self.width,
				bottom: target.midY + self.height / 2,
				left: target.right
			}
		case 'west':
			return {
				top: target.midY - self.height / 2,
				right: target.left,
				bottom: target.midY + self.height / 2,
				left: target.left - self.width
			}
		default:
			throw new Error('invalid position "' + pos + '"');
	}
}

/**
 * Cancel the `.hide()` timeout.
 *
 * @api private
 */

Satellite.prototype.cancelHide = function (){
	this.classList.remove('satellite-hide')
	clearTimeout(this._hide);
	delete this._hide
	return this
}

/**
 * Hide the Satellite with optional `ms` delay.
 *
 * Emits "hide" event.
 *
 * @param {Number} ms
 * @return {Satellite}
 * @api public
 */

Satellite.prototype.hide = function (ms){
	this.classList.add('satellite-hide')
	// duration
	if (ms) {
		this._hide = setTimeout(this.hide.bind(this), ms)
	} else {
		viewPort.off('resize', this.onResize, this)
		viewPort.off('scroll', this.reposition, this)
		this.events.emit('hide')
	}
	return this
}

/**
 * Hide then destroy
 *
 * @param {Number} [ms]
 * @return {this}
 * @api public
 */

Satellite.prototype.remove = function(ms){
	if (!this.view.parentElement) return this
	this.events.on('hide', function(){
		this.events.clear()
		if (this._targetEvents) this._targetEvents.clear()
		document.body.removeChild(this.view)
	})
	this.hide(ms)
	return this
}
