

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-css/index.js", Function("exports, require, module",
"\nmodule.exports = function(el, obj){\n  for (var key in obj) {\n    var val = obj[key];\n    if ('number' == typeof val) val += 'px';\n    el.style[key] = val;\n  }\n};\n//@ sourceURL=component-css/index.js"
));
require.register("jkroso-delegate/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar bind = require('event').bind\n\n// Shim browser support\nElement.prototype.matchesSelector = Element.prototype.matchesSelector\n\t|| Element.prototype.webkitMatchesSelector\n\t|| Element.prototype.mozMatchesSelector\n\t|| Element.prototype.msMatchesSelector\n\t|| Element.prototype.oMatchesSelector\n\t|| function (selector) {\n\t\tvar nodes = this.parentNode.querySelectorAll(selector)\n\t\t  , len = nodes.length\n\t\twhile (len--) if (nodes[len] === this) return true\n\t\treturn false\n\t}\n\n/**\n * Delegate event `type` to `selector`\n * and invoke `fn(e)`. A callback function\n * is returned which may be passed to `.unbind()`.\n *\n * @param {Element} el\n * @param {String} selector\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, selector, type, fn, capture){\n\treturn bind(el, type, function delegator (e) {\n\t\tif (e.delegateTarget = match(e.target, this, selector))\n\t\t\tfn.call(e.delegateTarget, e)\n\t}, capture)\n}\n\n/**\n * Look for an element witch matches the selector\n *\n * @param {Element} bottom the starting place for the search\n * @param {Element} top bottom must be within this\n * @param {String} selector a css query used to determine if a node matches\n * @return {Element|undefined}\n */\nexports.match = match\nfunction match (bottom, top, selector) {\n\twhile (bottom !== top) {\n\t\tif (bottom.matchesSelector(selector)) return bottom\n\t\tbottom = bottom.parentElement\n\t}\n}\n\n/**\n * Unbind event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @api public\n */\n\nexports.unbind = require('event').unbind\n//@ sourceURL=jkroso-delegate/index.js"
));
require.register("jkroso-keycode/index.js", Function("exports, require, module",
"// Source: http://jsfiddle.net/vWx8V/\n// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes\n\n/**\n * Conenience method returns corresponding value for given keyName or keyCode.\n *\n * @param {Mixed} keyCode {Number} or keyName {String}\n * @return {Mixed}\n * @api public\n */\nexports = module.exports = function (search) {\n\tif (typeof search === 'string') return codes[search.toLowerCase()]\n\treturn names[search]\n}\n\n/**\n * Get by name\n *\n *   exports.code['Enter'] // => 13\n */\nvar codes = exports.code = {\n\t'backspace': 8,\n\t'tab': 9,\n\t'enter': 13,\n\t'shift': 16,\n\t'ctrl': 17,\n\t'alt': 18,\n\t'pause/break': 19,\n\t'caps lock': 20,\n\t'esc': 27,\n\t'space': 32,\n\t'page up': 33,\n\t'page down': 34,\n\t'end': 35,\n\t'home': 36,\n\t'left': 37,\n\t'up': 38,\n\t'right': 39,\n\t'down': 40,\n\t'insert': 45,\n\t'delete': 46,\n\t'windows': 91,\n\t'right click': 93,\n\t'numpad *': 106,\n\t'numpad +': 107,\n\t'numpad -': 109,\n\t'numpad .': 110,\n\t'numpad /': 111,\n\t'num lock': 144,\n\t'scroll lock': 145,\n\t'my computer': 182,\n\t'my calculator': 183,\n\t';': 186,\n\t'=': 187,\n\t',': 188,\n\t'-': 189,\n\t'.': 190,\n\t'/': 191,\n\t'`': 192,\n\t'[': 219,\n\t'\\\\': 220,\n\t']': 221,\n\t\"'\": 222\n}\n\n/*!\n * Programatically add the following\n */\nfor (var i = 48; i < 58; i++) codes[i - 48] = i\n// '0': 48,\n// '1': 49,\n// '2': 50,\n// '3': 51,\n// '4': 52,\n// '5': 53,\n// '6': 54,\n// '7': 55,\n// '8': 56,\n// '9': 57,\n\nfor (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32\n// 'a': 65,\n// 'b': 66,\n// 'c': 67,\n// 'd': 68,\n// 'e': 69,\n// 'f': 70,\n// 'g': 71,\n// 'h': 72,\n// 'i': 73,\n// 'j': 74,\n// 'k': 75,\n// 'l': 76,\n// 'm': 77,\n// 'n': 78,\n// 'o': 79,\n// 'p': 80,\n// 'q': 81,\n// 'r': 82,\n// 's': 83,\n// 't': 84,\n// 'u': 85,\n// 'v': 86,\n// 'w': 87,\n// 'x': 88,\n// 'y': 89,\n// 'z': 90,\n\nfor (i = 1; i < 13; i++) codes['f'+i] = i + 111\n// 'f1': 112,\n// 'f2': 113,\n// 'f3': 114,\n// 'f4': 115,\n// 'f5': 116,\n// 'f6': 117,\n// 'f7': 118,\n// 'f8': 119,\n// 'f9': 120,\n// 'f10': 121,\n// 'f11': 122,\n// 'f12': 123,\n\nfor (i = 0; i < 10; i++) codes['numpad '+i] = i + 96\n// 'numpad 0': 96,\n// 'numpad 1': 97,\n// 'numpad 2': 98,\n// 'numpad 3': 99,\n// 'numpad 4': 100,\n// 'numpad 5': 101,\n// 'numpad 6': 102,\n// 'numpad 7': 103,\n// 'numpad 8': 104,\n// 'numpad 9': 105,\n\n/**\n * Get by code\n *\n *   exports.name[13] // => 'Enter'\n */\nvar names = exports.title = {}\n\n// Create reverse mapping\nfor (i in codes) names[codes[i]] = i//@ sourceURL=jkroso-keycode/index.js"
));
require.register("jkroso-dom-event/src/index.js", Function("exports, require, module",
"var code = require('keycode').code\n\n/**\n * Create a keyboard event\n *\n *   key('press', 'enter')\n *   key('down', 'caps lock')\n *   key('up', 'k')\n *\n * @param {String} type 'up', 'down', or 'press'\n * @param {String} key the key being pressed\n * @param {Object} o any options such as ctrl etc..\n * @return {KeyboardEvent}\n */\nexports.key = function (type, key, o) {\n\to || (o = {})\n\tif (type.slice(0, 3) !== 'key') type = 'key' + type\n\tvar keycode = code[key]\n\tif (keycode === undefined) throw new Error('invalid key: '+key)\n\tkey = key.length === 1 ? key.charCodeAt(0) : 0\n\t// Prefer custom events to avoid webkits bug https://bugs.webkit.org/show_bug.cgi?id=16735\n\tif (Event) {\n\t\tvar e = new Event(type, {\n\t\t\tbubbles: o.bubbles !== false,\n\t\t\tcancelable: o.cancelable !== false\n\t\t})\n\t\te.keyCode = keycode\n\t\te.charCode = key\n\t\te.shift = o.shift || false\n\t\te.meta = o.meta || false\n\t\te.ctrl = o.ctrl || false\n\t\te.alt = o.alt || false\n\t} else {\n\t\tvar e = document.createEvent('KeyboardEvent')\n\t\t// https://developer.mozilla.org/en/DOM/event.initKeyEvent\n\t\t// https://developer.mozilla.org/en/DOM/KeyboardEvent\n\t\te[e.initKeyEvent ? 'initKeyEvent' : 'initKeyboardEvent'](\n\t\t\ttype,\t\t\t\t\t\t\t// DOMString typeArg\n\t\t\to.bubbles !== false,\t\t// boolean canBubbleArg\n\t\t\to.cancelable !== false,\t// boolean cancelableArg\n\t\t\twindow,\t\t\t\t\t\t// Specifies UIEvent.view.\n\t\t\to.ctrl === true,\t\t\t// ctrl\n\t\t\to.alt === true,\t\t\t// alt\n\t\t\to.shift === true,\t\t\t// shift\n\t\t\to.meta === true,\t\t\t// meta\n\t\t\tkeycode,\t\t\t\t\t\t// unsigned long keyCodeArg\n\t\t\tkey\t\t\t\t\t\t\t// unsigned long charCodeArg\n\t\t)\n\t}\n\treturn e\n}\n\n/**\n * Create a native mouse event\n *\n *   mouse('move', {clientX: 50, clientY: 50})\n *   mouse('move') // apply defualts\n * \n * @param {String} type of mouse event\n * @param {Object} [o] options\n * @return {MouseEvent}\n */\nexports.mouse = function (type, o) {\n\tif (type[0] !== 'm' && type !== 'click' && type !== 'dblclick') type = 'mouse'+type\n\tvar e = document.createEvent('MouseEvents')\n\to || (o = {})\n\t// https://developer.mozilla.org/en/DOM/event.initMouseEvent\n\te.initMouseEvent(\n\t\ttype,\n\t\to.bubbles !== false, // canBubble\n\t\to.cancelable === false, // cancelable\n\t\twindow, // 'AbstractView'\n\t\to.clicks || (type === 'dbclick' ? 2 : 0), // click count\n\t\to.screenX || 0, // screenX\n\t\to.screenY || 0, // screenY\n\t\to.clientX || 0, // clientX\n\t\to.clientY || 0, // clientY\n\t\to.ctrl !== false, // ctrl\n\t\to.alt !== false, // alt\n\t\to.shift !== false, // shift\n\t\to.meta !== false, // meta\n\t\to.button !== false, // mouse button\n\t\tnull // relatedTarget\n\t)\n\treturn e\n}\n\nvar Event = window.Event\n/*!\n * Prefer Event since its leaner\n * but as soon as I find a browser that breaks, I'll uncomment the following\n */\n// try {new Event('')}\n// catch (e) {Event = window.CustomEvent}\n\n/**\n * Create a custom event\n *\n *   custom('select', {item: item})\n *   custom('select', {bubbles: false}) // to prevent bubbling\n *   custom('select', {cancelable: false}) // to prevent bubbling\n *\n * @param {String} type can be anthing\n * @param {Object} o custom properties you would like your event to have\n * @return {Event}\n */\nexports.custom = function (type, o) {\n\to || (o = {})\n\tvar e = new Event(type, {\n\t\tbubbles: o.bubbles !== false,\n\t\tcancelable: o.cancelable === false\n\t})\n\tfor (var prop in o) e[prop] = o[prop]\n\treturn e\n}//@ sourceURL=jkroso-dom-event/src/index.js"
));
require.register("jkroso-dom-emitter/index.js", Function("exports, require, module",
"var bind = require('event').bind\n  , unbind = require('event').unbind\n  , delegate = require('delegate').bind\n  , match = require('delegate').match\n  , Emitter = require('emitter')\n  , on = Emitter.prototype.on\n  , off = Emitter.prototype.off\n  , emit = Emitter.prototype.emit\n  , mouse = require('dom-event').mouse\n  , keyboard = require('dom-event').key\n  , custom = require('dom-event').custom\n\nmodule.exports = DomEmitter\n\n/**\n * Initialize a `DomEmitter`\n *\n *   new DomEmitter(document.body)\n *   new DomEmitter(document.body, {\n *     onClick: console.log  \n *   })\n *   DomEmitter.call(this) // this.view will be the dom node\n *   \n * @param {Object} [view=this.view]\n * @param {Object} [context=this]\n * @api public\n */\n\nfunction DomEmitter(view, context) {\n\tEmitter.call(this)\n\tthis.view || (this.view = view)\n\tthis._context = context || this\n\tthis._handlers = {}\n}\n\n/**\n * Bind to `event` with optional `method` name. When `method` is \n * undefined it becomes `event` with the \"on\" prefix. Delegation is \n * specified after the event name\n *\n *    events.on('click', 'onClick')\n *    events.on('click') // implies \"onClick\"\n *    events.on('click', function (e) {})\n *    events.on('click .ok') // will only trigger if the click happened within a child with .ok class\n *\n * @param {String} event\n * @param {String} [method]\n * @return {Function} the function that was subscribed\n * @api public\n */\n\nDomEmitter.prototype.on = function(event, method){\n\tvar parsed = parse(event)\n\t  , name = parsed.name\n\t  , handler = this._handlers[name]\n\t  , self = this\n\n\tif (typeof method === 'string')\n\t\tmethod = this._context[method]\n\telse if (!method)\n\t\tmethod = this._context['on' + capitalize(name)]\n\n\tif (!method) throw new Error('Can\\'t find a method')\n\n\tif (!handler) {\n\t\thandler = this._handlers[name] = function dispatcher (e) {\n\t\t\temit.call(self, name, e)\n\t\t\tvar selectors = dispatcher.selectors\n\t\t\tif (selectors) {\n\t\t\t\tfor (var i = 0, len = selectors.length; i < len; i++) {\n\t\t\t\t\tif (e.delegateTarget = match(e.target, this, selectors[i]))\n\t\t\t\t\t\temit.call(self, name+' '+selectors[i], e)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\thandler.deps = 0\n\t\tbind(this.view, name, handler)\n\t}\n\thandler.deps++\n\t\n\tif (parsed.selector)\n\t\thandler.selectors = (handler.selectors || []).concat(parsed.selector)\n\n\ton.call(this, event, method, this._context)\n\n\treturn method\n}\n\n/*!\n * Uppercase the first letter\n * @api private\n */\nfunction capitalize (word) {\n\treturn word[0].toUpperCase() + word.slice(1)\n}\n\n/**\n * Unbind a single binding\n * \n * All the following a equivilent:\n *\n *   events.off('click', 'onClick')\n *   events.off('click') // implies 'onClick'\n *   events.off('click', events.onClick)\n *\n * @param {String} [event]\n * @param {String} [method]\n * @return {Function} callback\n * @api public\n */\n\nDomEmitter.prototype.off = function(event, method){\n\tvar parsed = parse(event)\n\t  , name = parsed.name\n\t  , handler = this._handlers[name]\n\n\tif (typeof method === 'string') {\n\t\tmethod = this._context[method]\n\t}\n\telse if (!method) {\n\t\tmethod = this._context['on' + capitalize(name)]\n\t}\n\tif (!method) throw new Error('Can\\'t find a method')\n\n\tif (--handler.deps <= 0) {\n\t\tdelete this._handlers[name]\n\t\tunbind(this.view, name, handler)\n\t}\n\n\treturn method\n}\n\n/*!\n * Is it a native mouse event\n */\nvar mouseRegex = /^mouse(?:up|down|move|o(?:ver|ut)|enter|leave)|(?:dbl)?click$/\n\n/*!\n * Is it a native keyboard event\n * Extract the keys title while we are at it\n */\nvar keyRegex = /^key(up|down|press) +([\\w\\/]+(?: \\w+)?)$/\n\n/**\n * Create a DOM event and send it down to the DomEmitter's target\n *\n *   manager.emit('mousedown', {clientX:50, clientY:50})\n *   manager.emit('login', {user: user})\n * \n * @param {String} event type\n * @param {Any} data to merged with the dom event object\n */\nDomEmitter.prototype.emit = function (topic, data) {\n\tvar match, event\n\tif (match = mouseRegex.exec(topic))\n\t\tevent = mouse(topic, data)\n\telse if (match = keyRegex.exec(topic))\n\t\tevent = keyboard(match[1], match[2], data)\n\telse\n\t\tevent = custom(topic, data)\n\tthis.view.dispatchEvent(event)\n}\n\n/**\n * Remove all bound functions\n *\n *   this.clear() // removes all\n *   this.clear('click') // just click handlers\n *\n * @param {String} event if you want to limit to a certain type\n * @api public\n */\nDomEmitter.prototype.clear = function (event) {\n\tif (event == null) {\n\t\tfor (event in this._callbacks)\n\t\t\tthis.clear(event)\n\t}\n\telse {\n\t\tvar handlers = this._callbacks[event]\n\t\t  , i = handlers.length\n\t\twhile (i--)\n\t\t\tif (typeof handlers[i] === 'function') \n\t\t\t\tthis.off(event, handlers[i])\n\t}\n}\n\n/**\n * Parse event / selector string.\n *\n * @param {String} string\n * @return {Object}\n * @api private\n */\n\nfunction parse(str) {\n\tstr = str.split(' ')\n\tvar event = str.shift()\n\treturn { name: event, selector: str.join(' ') }\n}//@ sourceURL=jkroso-dom-emitter/index.js"
));
require.register("jkroso-domify/index.js", Function("exports, require, module",
"/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) return [document.createTextNode(html)]\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return [el.removeChild(el.lastChild)];\n  }\n  \n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  return orphan(el.children);\n}\n\n/**\n * Orphan `els` and return an array.\n *\n * @param {NodeList} els\n * @return {Array}\n * @api private\n */\n\nfunction orphan(els) {\n  var ret = [];\n\n  while (els.length) {\n    ret.push(els[0].parentNode.removeChild(els[0]));\n  }\n\n  return ret;\n}\n//@ sourceURL=jkroso-domify/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("jkroso-emitter/src/index.js", Function("exports, require, module",
"module.exports = Emitter\r\n\r\n/**\r\n * Generate an instance of Emitter\r\n *\r\n *   var emitter = new Emitter\r\n */\r\nfunction Emitter () {this._callbacks = {}}\r\n\r\n/**\r\n * An alternative constructor syntax\r\n */\r\nEmitter.new = function () {\r\n\treturn new(this)\r\n}\r\n\r\n/**\r\n * Add emitter behavior to any object\r\n * \r\n * @param {Object} obj to recieve Emitter methods\r\n * @return {obj} that you passed in\r\n */\r\nEmitter.mixin = function (obj) {\r\n\tEmitter.call(obj)\r\n\tfor (var key in proto)\r\n\t\tobj[key] = proto[key]\r\n\treturn obj\r\n}\r\n\r\nvar proto = Emitter.prototype\r\n\r\n/**\r\n * Generate an event\r\n *\r\n *   emitter.emit('event', new Date)\r\n *   \r\n * @param {String} topic the events topic\r\n * @param {Any} data to be passed to all handlers\r\n */\r\nproto.publish =\r\nproto.emit = function (topic, data) {\r\n\tvar calls = this._callbacks[topic]\r\n\tif (!calls) return\r\n\ttopic = calls.length\r\n\twhile (topic--)\r\n\t\tcalls[topic].call(calls[--topic], data)\r\n}\r\n\r\n/**\r\n * Add a subscription under a topic name\r\n *\r\n *   emitter.on('event', function(data){})\r\n *   emitter.on('event') // implies emitter.on('event', emitter.onEvent)\r\n *   emitter.on('event', function(){this === emitter}, emitter)\r\n *   emitter.on('event', function(){this === emitter}) // the current context is the default\r\n *\r\n * @param {String} topic\r\n * @param {Function} callback to be called when the topic is emitted\r\n * @param {Object} context to call the the function with\r\n * @return {callback} whatever function was subscribed\r\n */\r\nproto.on = function (topic, callback, context) {\r\n\tvar calls = this._callbacks\r\n\tif (callback == null) {\r\n\t\tcallback = this['on'+capitalize(topic)]\r\n\t\tif (!callback) throw new Error('Could not find a method for '+topic)\r\n\t}\r\n\t// Push to the front of the array; Using concat to avoid mutating the old array\r\n\tcalls[topic] = [context || this, callback].concat(calls[topic] || [])\r\n\r\n\treturn callback\r\n}\r\n\r\n/*!\r\n * Capitalize the first letter of a word\r\n */\r\nfunction capitalize (word) {\r\n\treturn word[0].toUpperCase() + word.slice(1)\r\n}\r\n\r\n/**\r\n * Add the subscription but insure it never called more than once\r\n * @see Emitter#on\r\n */\r\nproto.once = function (topics, callback, context) {\r\n\tvar self = this\r\n\treturn this.on(\r\n\t\ttopics, \r\n\t\tfunction on (data) {\r\n\t\t\tself.off(topics, on)\r\n\t\t\treturn callback.call(context, data)\r\n\t\t}, \r\n\t\tcontext\r\n\t)\r\n}\r\n\r\n/**\r\n * Remove subscriptions\r\n *\r\n *   emitter.off() // clears all topics\r\n *   emitter.off('topic') // clears all handlers from the topic 'topic'\r\n *   emitter.off('topic', fn) // as above but only if the handler === fn\r\n *   emitter.off('topic', fn, window) // as above but only if the context is `window`\r\n *\r\n * @param {String} [topic]\r\n * @param {Function} [callback]\r\n * @param {Any} [context]\r\n */\r\nproto.off = function (topic, callback, context) {\r\n\tif (topic == null)\r\n\t\tthis._callbacks = {}\r\n\telse {\r\n\t\tvar calls = this._callbacks\r\n\t\tif (callback) {\r\n\t\t\tvar events = calls[topic]\r\n\t\t\tif (!events) return\r\n\t\t\tvar i = events.length\r\n\t\t\twhile (i--)\r\n\t\t\t\tif (events[i--] === callback) {\r\n\t\t\t\t\tif (context && events[i] !== context) continue\r\n\t\t\t\t\tevents = events.slice()\r\n\t\t\t\t\tevents.splice(i, 2)\r\n\t\t\t\t\tcalls[topic] = events\r\n\t\t\t\t}\r\n\t\t}\r\n\t\telse\r\n\t\t\tdelete calls[topic]\r\n\t}\r\n}//@ sourceURL=jkroso-emitter/src/index.js"
));
require.register("jkroso-viewport/src/index.js", Function("exports, require, module",
"var events = require('event')\n\nrequire('emitter').mixin(exports)\n\nvar html = document.getElementsByTagName('html')[0]\n\nevents.bind(window, 'resize', function (e) {\n\tsize()\n\tposition()\n\texports.emit('resize', exports)\n})\n\nevents.bind(window, 'scroll', function () {\n\tposition()\n\texports.emit('scroll', exports)\n})\n\n/**\n * Initialise\n */\nsize()\nposition()\n\n/**\n * Update the size attributes\n */\nfunction size () {\n\texports.height = html.clientHeight\n\texports.width = html.clientWidth\n}\n\n/**\n * Update the position attributes\n */\nfunction position () {\n\texports.top = window.scrollY\n\texports.left = window.scrollX\n\texports.right = exports.left + exports.width\n\texports.bottom = exports.top + exports.height\n}//@ sourceURL=jkroso-viewport/src/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("jkroso-computed-style/src/index.js", Function("exports, require, module",
"/**\n * Get the computed style of a DOM element\n * \n *   style(document.body) // => {width:'500px', ...}\n * \n * @param {Element} element\n * @return {Object}\n */\n\n// Accessing via window for jsDOM support\nmodule.exports = window.getComputedStyle\n\n// Fallback to elem.currentStyle for IE < 9\nif (!module.exports) {\n\tmodule.exports = function (elem) {\n\t\treturn elem.currentStyle\n\t}\n}//@ sourceURL=jkroso-computed-style/src/index.js"
));
require.register("jkroso-position/src/index.js", Function("exports, require, module",
"var style = require('computed-style')\n\nexports = module.exports = position\nexports.container = containerBox\nexports.offsetParent = offsetParent\nexports.relative = \nexports.offset = offset \n\n/**\n * Get the location of the element relative to the top left of the documentElement\n *\n * @param {Element} element\n * @return {Object} {top, right, bottom, left} in pixels\n */\n\nfunction position (element) {\n\tvar box = element.getBoundingClientRect()\n\t  , scrollTop = window.scrollY\n\t  , scrollLeft = window.scrollX\n\t// Has to be copied since ClientRects is immutable\n\treturn {\n\t\ttop: box.top + scrollTop,\n\t\tright: box.right + scrollLeft,\n\t\tleft: box.left + scrollLeft,\n\t\tbottom: box.bottom + scrollTop,\n\t\twidth: box.width,\n\t\theight: box.height\n\t}\n}\n\n/**\n * Get the position of one element relative to another\n *\n *   offset(child)\n *   offset(child, parent)\n *   \n * @param {Element} child the subject element\n * @param {Element} [parent] offset will be calculated relative to this element. \n *   This parameter is optional and will default to the offsetparent of the \n *   `child` element\n * @return {Object} {x, y} in pixels\n */\n\nfunction offset (child, parent) {\n\t// default to comparing with the offsetparent\n\tparent || (parent = offsetParent(child))\n\tif (!parent) {\n\t\tparent = position(child)\n\t\treturn {\n\t\t\tx: parent.left,\n\t\t\ty: parent.top\n\t\t}\n\t}\n\n\tvar offset = position(child)\n\t  , parentOffset = position(parent)\n\t  , css = style(child)\n\n\t// Subtract element margins\n\toffset.top  -= parseFloat(css.marginTop)  || 0\n\toffset.left -= parseFloat(css.marginLeft) || 0\n\n\t// Allow for the offsetparent's border\n\toffset.top  -= parent.clientTop\n\toffset.left -= parent.clientLeft\n\n\treturn {\n\t\tx: offset.left - parentOffset.left,\n\t\ty:  offset.top  - parentOffset.top\n\t}\n}\n\n// Alternative way of calculating offset perhaps its cheaper\n// function offset (el) {\n// \tvar x = el.offsetLeft, y = el.offsetTop\n// \twhile (el = el.offsetParent) {\n// \t\tx += el.offsetLeft + el.clientLeft\n// \t\ty += el.offsetTop + el.clientTop\n// \t}\n// \treturn {left: x, top: y}\n// }\n\n/**\n * Determine the perimeter of an elements containing block. This is the box that\n * determines the childs positioning. The container cords are relative to the \n * document element not the viewport; so take into account scrolling.\n *\n * @param {Element} child\n * @return {Object}\n */\n\nfunction containerBox (child) {\n\tvar container = offsetParent(child)\n\n\tif (!container) {\n\t\tcontainer = child.ownerDocument.documentElement\n\t\t// The outer edges of the document\n\t\treturn {\n\t\t\ttop   : 0,\n\t\t\tleft  : 0,\n\t\t\tright : container.offsetWidth,\n\t\t\tbottom: container.offsetHeight,\n\t\t\twidth : container.offsetWidth,\n\t\t\theight: container.offsetHeight\n\t\t}\n\t}\n\n\tvar offset = position(container)\n\t  , css = style(container)\n\n\t// Remove its border\n\toffset.top    += parseFloat(css.borderTopWidth) || 0\n\toffset.left   += parseFloat(css.borderLeftWidth)|| 0\n\toffset.right  -= parseFloat(css.borderRightWidth) || 0\n\toffset.bottom -= parseFloat(css.borderBottomWidth) || 0\n\toffset.width   = offset.right - offset.left\n\toffset.height  = offset.bottom - offset.top\n\n\treturn offset\n}\n\n/**\n * Get the element that serves as the base for this ones positioning.\n * If no parents are postioned it will return undefined which isn't \n * what you might expect if you know the offsetparent spec or have \n * used `jQuery.offsetParent`\n * \n * @param {Element} element\n * @return {Element} if a positioned parent exists\n */\n\nfunction offsetParent (element) {\n\tvar parent = element.offsetParent\n\twhile (parent && style(parent).position === \"static\") parent = parent.offsetParent\n\treturn parent\n}\n//@ sourceURL=jkroso-position/src/index.js"
));
require.register("satellite/src/index.js", Function("exports, require, module",
"var DomEmitter = require('dom-emitter')\r\n  , domify = require('domify')\r\n  , viewPort = require('viewport')\r\n  , css = require('css')\r\n  , classes = require('classes')\r\n  , position = require('position')\r\n  , container = position.container\r\n\r\nmodule.exports = Satellite\r\n\r\n/**\r\n * Initialize a `Satellite` with the given `content`.\r\n *\r\n *   new Satellite('moon')\r\n * \r\n * @param {Mixed} content\r\n * @api public\r\n */\r\nfunction Satellite (content) {\r\n\tthis.view = domify(require('./template'))[0]\r\n\tDomEmitter.call(this)\r\n\tthis.classList = classes(this.view)\r\n\tif (content != null) this.append(content)\r\n\tif (Satellite.effect) this.effect(Satellite.effect)\r\n\tthis.prefer('north')\r\n\tthis.appendTo(document.body)\r\n}\r\n\r\n/**\r\n * Alternative constructor\r\n * @return {Satellite}\r\n */\r\nSatellite.new = function (content) {return new this(content)}\r\n\r\n/**\r\n * Inherits from `Emitter.prototype`.\r\n */\r\n\r\nvar proto = Satellite.prototype = Object.create(DomEmitter.prototype)\r\nproto.constructor = Satellite\r\n\r\n/**\r\n * Insert content into the satellite's body\r\n * \r\n * @param {String|Element} content\r\n * @return {Self}\r\n */\r\n\r\nproto.append = function (content) {\r\n\tvar view = this.view\r\n\tif (typeof content === 'string') {\r\n\t\tdomify(content).forEach(function (node) {\r\n\t\t\tview.appendChild(node)\r\n\t\t})\r\n\t}\r\n\telse if (content instanceof Element) {\r\n\t\tview.appendChild(content)\r\n\t}\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Attach to the given `el` with optional hide `delay`.\r\n *\r\n * @param {Element} el\r\n * @param {Number} delay\r\n * @return {Self}\r\n * @api public\r\n */\r\nproto.attach = function(el, delay){\r\n\tthis.orbit(el)\r\n\tvar events = this._targetEvents = new DomEmitter(el, this)\r\n\tevents.on('mouseover', function(){\r\n\t\tthis.show()\r\n\t\tthis.cancelHide()\r\n\t})\r\n\tevents.on('mouseout', function(){\r\n\t\tthis.hide(delay)\r\n\t})\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Insert the satellite as a child\r\n * \r\n * @param {Element} element which will be the satellite's parent\r\n * @return {Self}\r\n */\r\nproto.appendTo = function (el) {\r\n\tel.appendChild(this.view)\r\n\tthis.cache()\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Update the cached size of the current containing node and the Satellite element\r\n * \r\n * @return {Self}\r\n * @api private\r\n */\r\nproto.cache = function () {\r\n\tthis._container = container(this.view)\r\n\tthis.width = this.view.offsetWidth\r\n\tthis.height = this.view.offsetHeight\r\n}\r\n\r\n/**\r\n * Cancel hide on hover, hide with the given `delay`.\r\n *\r\n * @param {Number} delay\r\n * @return {Self}\r\n * @api public\r\n */\r\nproto.cancelHideOnHover = function(delay){\r\n\tthis.on('mouseover', 'cancelHide')\r\n\tthis.on('mouseout', function () {\r\n\t\tthis.hide(delay)\r\n\t})\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Get current effect or set the effect to `type`.\r\n *\r\n *  - `fade`\r\n *\r\n * @param {String} [type]\r\n * @return {Self}\r\n */\r\nproto.effect = function(type){\r\n\tif (type == null) return this._effect\r\n\tif (this._effect) this.classList.remove(this._effect)\r\n\tthis.classList.add(this._effect = type)\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Set position preference:\r\n *\r\n *  - `north`\r\n *  - `north east`\r\n *  - `north west`\r\n *  - `south`\r\n *  - `south east`\r\n *  - `south west`\r\n *  - `east`\r\n *  - `west`\r\n *\r\n * @param {String} type\r\n * @return {Self}\r\n */\r\nproto.prefer = function(type){\r\n\tvar types = (type).match(/(south|north)?\\s*(east|west)?/)\r\n\tif (!types) throw new Error('Invalid position type')\r\n\tthis._preference = type\r\n\tthis._vertical = types[1] || ''\r\n\tthis._horizontal = types[2] || ''\r\n\tsetClass(this, type)\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Calculate or set the target area\r\n *\r\n * To target an element:\r\n *   var target = document.querySelector('#target')\r\n *   satellite.orbit(target)\r\n *   \r\n * To specify an explit target area:\r\n *   satellite.orbit(target.getBoundingClientRects())\r\n *   \r\n * To specify a point:\r\n *   satellite.orbit(100, 100)\r\n * \r\n * @param  {Object|Element|Number} x\r\n * @param {Number} [y] if x is a number y should also be specified\r\n * @return {Self}\r\n */\r\nproto.orbit = function (x, y) {\r\n\tvar box\r\n\tdelete this._target\r\n\tif (y == null) {\r\n\t\tif (x instanceof Element) {\r\n\t\t\tthis._target = x\r\n\t\t\tbox = position(x)\r\n\t\t} else {\r\n\t\t\t// Is an object\r\n\t\t\tbox = x\r\n\t\t}\r\n\t} else {\r\n\t\t// Is an explicit cord\r\n\t\tbox = {\r\n\t\t\tleft: x,\r\n\t\t\tright: x,\r\n\t\t\ttop: y,\r\n\t\t\tbottom: y\r\n\t\t}\r\n\t}\r\n\tbox.midX = (box.left + box.right) / 2\r\n\tbox.midY = (box.top + box.bottom) / 2\r\n\tthis._targetBox = box\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Show the Satellite attached to `el`.\r\n *\r\n * Emits \"show\" (el) event.\r\n *\r\n * @return {Self}\r\n */\r\nproto.show = function () {\r\n\tthis.classList.remove('satellite-hide')\r\n\r\n\tviewPort.on('resize', this.onResize, this)\r\n\tviewPort.on('scroll', this.reposition, this)\r\n\t// Call resize incase something changed while the Satellite was hidden\r\n\tthis.onResize()\r\n\tthis.emit('show')\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Handler for resize events\r\n * @api private\r\n */\r\nproto.onResize = function (e) {\r\n\t// Target node might of changed size\r\n\tif (this._target) this.orbit(this._target)\r\n\t// as might its container\r\n\tthis.cache()\r\n\tthis.reposition()\r\n}\r\n\r\n/**\r\n * Apply the position\r\n *\r\n * @api private\r\n */\r\nproto.reposition = function(){\r\n\t// Default all properties to auto\r\n\tvar style = {left:'auto', top:'auto', right:'auto', bottom: 'auto'}\r\n\tvar offset = this.suggest()\r\n\t// Ensure the correct position class is applied\r\n\tif (offset.suggestion !== this._preference) setClass(this, offset.suggestion)\r\n\r\n\t// Base positioning on the bottom edge so if content grows it positioning is still correct\r\n\t// if (this._vertical === 'north') css.bottom = document.body.offsetHeight - off.bottom\r\n\tstyle.top = offset.top - this._container.top\r\n\t// Base positioning on the right edge so if content grows it positioning is still correct\r\n\t// if (this._horizontal === 'east') css.right = document.body.offsetWidth - off.right\r\n\tstyle.left = offset.left - this._container.left\r\n\r\n\tcss(this.view, style)\r\n}\r\n\r\n/**\r\n * Compute the optimal positioning so as to maximise the area of the satellite\r\n * shown on screen while respecting the prefered location if there is enough room\r\n *\r\n * @return {Object} {top, left, bottom, right, suggestion}\r\n * @api private\r\n */\r\nproto.suggest = function(){\r\n\tvar top = viewPort.top\r\n\t  , left = viewPort.left\r\n\t  , right = viewPort.right\r\n\t  , bottom = viewPort.bottom\r\n\t  , target = this._targetBox\r\n\t  , offset = calcPosition(this, this._preference)\r\n\t  , y, x, suggestion\r\n\t// too high or too low...\r\n\tif (offset.top < top || offset.bottom > bottom) {\r\n\t\t// ...go where there is more room\r\n\t\tif (bottom - target.bottom > target.top - top)\r\n\t\t\ty = 'south'\r\n\t\telse \r\n\t\t\ty = 'north'\r\n\t}\r\n\t// too far to the right or left...\r\n\tif (offset.right > right || offset.left < left) {\r\n\t\t// ...go where there is more room\r\n\t\tif (right - target.right > target.left - left)\r\n\t\t\tx = 'east'\r\n\t\telse\r\n\t\t\tx = 'west'\r\n\t}\r\n\tsuggestion = ((y || this._vertical) + ' ' + (x || this._horizontal)).trim()\r\n\tif (suggestion !== this._preference) offset = calcPosition(this, suggestion)\r\n\toffset.suggestion = suggestion\r\n\treturn offset\r\n}\r\n\r\n/**\r\n * Replace position class\r\n *\r\n * @param {Satellite} sat instance \r\n * @param {String} pos\r\n * @api private\r\n */\r\nfunction setClass (sat, pos) {\r\n\tsat.classList\r\n\t\t.remove(sat._posClass)\r\n\t\t.add(sat._posClass = 'satellite-' + pos.split(' ').join('-'))\r\n}\r\n\r\n/**\r\n * Compute the screen location to render the Satellite\r\n * based on the given `pos`.\r\n *\r\n * @param {Satellite} self an instance\r\n * @param {String} pos\r\n * @return {Object}\r\n * @api private\r\n */\r\nfunction calcPosition (self, pos){\r\n\tvar target = self._targetBox\r\n\tswitch (pos) {\r\n\t\tcase 'north':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.top - self.height,\r\n\t\t\t\tright: target.midX + self.width / 2,\r\n\t\t\t\tbottom: target.top,\r\n\t\t\t\tleft: target.midX - self.width / 2\r\n\t\t\t}\r\n\t\tcase 'north west':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.top,\r\n\t\t\t\tright: target.left,\r\n\t\t\t\tbottom: target.top + self.height,\r\n\t\t\t\tleft: target.left - self.width\r\n\t\t\t}\r\n\t\tcase 'north east':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.top,\r\n\t\t\t\tright: target.right + self.width,\r\n\t\t\t\tbottom: target.top + self.height,\r\n\t\t\t\tleft: target.right\r\n\t\t\t}\r\n\t\tcase 'south':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.bottom,\r\n\t\t\t\tright: target.midX + self.width / 2,\r\n\t\t\t\tbottom: target.bottom + self.height,\r\n\t\t\t\tleft: target.midX - self.width / 2\r\n\t\t\t}\r\n\t\tcase 'south west':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.bottom - self.height,\r\n\t\t\t\tright: target.left,\r\n\t\t\t\tbottom: target.bottom,\r\n\t\t\t\tleft: target.left - self.width\r\n\t\t\t}\r\n\t\tcase 'south east':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.bottom - self.height,\r\n\t\t\t\tright: target.right + self.width,\r\n\t\t\t\tbottom: target.bottom,\r\n\t\t\t\tleft: target.right\r\n\t\t\t}\r\n\t\tcase 'east':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.midY - self.height / 2,\r\n\t\t\t\tright: target.right + self.width,\r\n\t\t\t\tbottom: target.midY + self.height / 2,\r\n\t\t\t\tleft: target.right\r\n\t\t\t}\r\n\t\tcase 'west':\r\n\t\t\treturn {\r\n\t\t\t\ttop: target.midY - self.height / 2,\r\n\t\t\t\tright: target.left,\r\n\t\t\t\tbottom: target.midY + self.height / 2,\r\n\t\t\t\tleft: target.left - self.width\r\n\t\t\t}\r\n\t\tdefault:\r\n\t\t\tthrow new Error('invalid position \"' + pos + '\"');\r\n\t}\r\n}\r\n\r\n/**\r\n * Cancel the `.hide()` timeout.\r\n *\r\n * @api private\r\n */\r\nproto.cancelHide = function (){\r\n\tthis.classList.remove('satellite-hide')\r\n\tclearTimeout(this._hide);\r\n\tdelete this._hide\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Hide the Satellite with optional `ms` delay.\r\n *\r\n * Emits \"hide\" event.\r\n *\r\n * @param {Number} ms\r\n * @return {Satellite}\r\n * @api public\r\n */\r\nproto.hide = function (ms){\r\n\tthis.classList.add('satellite-hide')\r\n\t// duration\r\n\tif (ms) {\r\n\t\tthis._hide = setTimeout(this.hide.bind(this), ms)\r\n\t} else {\r\n\t\tviewPort.off('resize', this.onResize, this)\r\n\t\tviewPort.off('scroll', this.reposition, this)\r\n\t\tthis.emit('hide')\r\n\t}\r\n\treturn this\r\n}\r\n\r\n/**\r\n * Hide then destroy\r\n *\r\n * @return {Self}\r\n * @api\r\n */\r\nproto.remove = function(ms){\r\n\tthis.on('hide', 'clear')\r\n\tthis.hide(ms)\r\n\treturn this\r\n}\r\n//@ sourceURL=satellite/src/index.js"
));
require.register("satellite/src/template.js", Function("exports, require, module",
"module.exports = '<div class=\"satellite satellite-hide\"></div>'//@ sourceURL=satellite/src/template.js"
));
require.alias("component-css/index.js", "satellite/deps/css/index.js");

require.alias("jkroso-dom-emitter/index.js", "satellite/deps/dom-emitter/index.js");
require.alias("jkroso-emitter/src/index.js", "jkroso-dom-emitter/deps/emitter/src/index.js");
require.alias("jkroso-emitter/src/index.js", "jkroso-dom-emitter/deps/emitter/index.js");

require.alias("jkroso-delegate/index.js", "jkroso-dom-emitter/deps/delegate/index.js");
require.alias("component-event/index.js", "jkroso-delegate/deps/event/index.js");

require.alias("component-event/index.js", "jkroso-dom-emitter/deps/event/index.js");

require.alias("jkroso-dom-event/src/index.js", "jkroso-dom-emitter/deps/dom-event/src/index.js");
require.alias("jkroso-dom-event/src/index.js", "jkroso-dom-emitter/deps/dom-event/index.js");
require.alias("jkroso-keycode/index.js", "jkroso-dom-event/deps/keycode/index.js");

require.alias("jkroso-domify/index.js", "satellite/deps/domify/index.js");

require.alias("jkroso-viewport/src/index.js", "satellite/deps/viewport/src/index.js");
require.alias("jkroso-viewport/src/index.js", "satellite/deps/viewport/index.js");
require.alias("component-event/index.js", "jkroso-viewport/deps/event/index.js");

require.alias("jkroso-emitter/src/index.js", "jkroso-viewport/deps/emitter/src/index.js");
require.alias("jkroso-emitter/src/index.js", "jkroso-viewport/deps/emitter/index.js");

require.alias("component-classes/index.js", "satellite/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("jkroso-position/src/index.js", "satellite/deps/position/src/index.js");
require.alias("jkroso-position/src/index.js", "satellite/deps/position/index.js");
require.alias("jkroso-computed-style/src/index.js", "jkroso-position/deps/computed-style/src/index.js");
require.alias("jkroso-computed-style/src/index.js", "jkroso-position/deps/computed-style/index.js");

require.alias("component-css/index.js", "jkroso-position/deps/css/index.js");

require.alias("satellite/src/index.js", "satellite/index.js");

