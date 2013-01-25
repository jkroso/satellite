var Satellite = require('satellite')

Satellite.effect = 'fade'

Satellite.new('<img src="maru-cat.jpg" width="200" height="100" style="display:block;"/>')
	.orbit(document.getElementById('maru'))
	.show()

var list = document.querySelectorAll('#north,#east,#west,#south,#north-west,#north-east,#south-west,#south-east')
Array.apply(null, list).forEach(function(target){
	var satellite = new Satellite(target.textContent)
	satellite.prefer(target.textContent.toLowerCase().split('-').join(' '))
	satellite.orbit(target)

	target.addEventListener('mouseover', function(){
		satellite.show()
	}, true)
	target.addEventListener('mouseout', function(){
		satellite.hide(200)
	}, true)
})

Satellite.new('<input type="search" placeholder="Search" />')
	.prefer('north')
	.attach(document.querySelector('#markup'), 100)
	.cancelHideOnHover(100)

Satellite.new('Some contents')
	.prefer('north')
	.orbit(document.querySelector('#auto-north'))
	.show();

new Satellite('Some Satellite contents')
	.prefer('south')
	.orbit(document.querySelector('#auto-south'))
	.show()

Satellite.new('I am a child of this node')
	.appendTo(document.querySelector('#parent'))
	.orbit(document.querySelector('#parent'))
	.show()