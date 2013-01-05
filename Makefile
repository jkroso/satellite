all: build Readme.md

install:
	@component install -d

build:
	@component build -dv

clean:
	@rm -rf build components

Readme.md: src/* docs/head.md docs/tail.md
	@cat docs/head.md > Readme.md
	@cat src/index.js\
	 | sed s/.*=.$$//\
	 | sed s/proto\./Satellite.prototype./\
	 | dox -a | sed s/^\#\#/\#\#\#/ >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: clean all build install