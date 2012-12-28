all: clean install build test docs

install:
	@component install -d

build:
	@component build -d -v

test:
	@google-chrome test/index.html

clean:
	@rm -rf build components

docs:
	@cat docs/head.md > Readme.md
	@dox --api < src/index.js >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test clean docs
