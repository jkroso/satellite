
serve: node_modules
	@node_modules/serve/bin/serve

node_modules: component.json
	@packin install --meta deps.json,component.json,package.json \
		--folder node_modules \
		--executables \
		--no-retrace

clean:
	rm -r node_modules

.PHONY: clean serve