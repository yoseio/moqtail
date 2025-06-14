.PHONY: install prod dev

install:
	yarn install

prod:
	yarn --cwd bytes build
	yarn --cwd moqtail-core build
	yarn --cwd client build


dev:
	yarn --cwd bytes build
	yarn --cwd moqtail-core build
	yarn --cwd client dev
