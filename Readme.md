# satellite

Position a container around the edge of another. The screenshot below shows all its positioning options. I have added basic styling in the screenshot to make the satellites visible. However out of the box it comes with no styling opinions. This project is based off component/tip which I found to be widely useful outside of tooltips. This is an extraction of the core functionality from that project, enhanced to suit my more general use cases. For an example use case [see](jkroso.github.com/contextmenu)

![screenshot](https://raw.github.com/jkroso/satellite/master/Screenshot.png)

## API

```javascript
var satelite = require('satellite')
```
  - [Satellite()](#satellite)
  - [Satellite.new()](#satellitenew)
  - [Satellite.append()](#satelliteappendcontentstringelement)
  - [Satellite.attach()](#satelliteattachelelementdelaynumber)
  - [Satellite.appendTo()](#satelliteappendtoelementelement)
  - [Satellite.cancelHideOnHover()](#satellitecancelhideonhoverdelaynumber)
  - [Satellite.effect()](#satelliteeffecttypestring)
  - [Satellite.prefer()](#satelliteprefertypestring)
  - [Satellite.orbit()](#satelliteorbitxobjectelementnumberynumber)
  - [Satellite.show()](#satelliteshow)
  - [Satellite.hide()](#satellitehidemsnumber)
  - [Satellite.remove()](#satelliteremove)

### Satellite()

  Initialize a `Satellite` with the given `content`.
  
```js
new Satellite('moon')
```

### Satellite.new()

  Alternative constructor

### Satellite.append(content:String|Element)

  Insert content into the satellite's body

### Satellite.attach(el:Element, delay:Number)

  Attach to the given `el` with optional hide `delay`.

### Satellite.appendTo(element:Element)

  Insert the satellite as a child

### Satellite.cancelHideOnHover(delay:Number)

  Cancel hide on hover, hide with the given `delay`.

### Satellite.effect([type]:String)

  Get current effect or set the effect to `type`.
  
   - `fade`

### Satellite.prefer(type:String)

  Set position preference:
  
   - `north`
   - `north east`
   - `north west`
   - `south`
   - `south east`
   - `south west`
   - `east`
   - `west`

### Satellite.orbit(x:Object|Element|Number, [y]:Number)

  Calculate or set the target area
  
  To target an element:
```js
var target = document.querySelector('#target')
satellite.orbit(target)
```

    
  To specify an explit target area:
```js
satellite.orbit(target.getBoundingClientRects())
```

    
  To specify a point:
```js
satellite.orbit(100, 100)
```

### Satellite.show()

  Show the Satellite attached to `el`.
  
  Emits "show" (el) event.

### Satellite.hide(ms:Number)

  Hide the Satellite with optional `ms` delay.
  
  Emits "hide" event.

### Satellite.remove()

  Hide then destroy

## Contributing
Please do! And any thoughts you have I'd love to here them. Just use the issue tracker.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
