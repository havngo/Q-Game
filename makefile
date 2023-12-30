include .env

all: install build

install:
	npm install
	npm install -C Common/FrontEnd/qwirkle

build:
	npm run build
	npm run build -C Common/FrontEnd/qwirkle

frontend: build_frontend start_frontend

build_frontend:
	npm run build -C Common/FrontEnd/qwirkle

start_frontend:
	npm run preview -C Common/FrontEnd/qwirkle -- --port=$(FRONT_END_PORT) &

clean_frontend:
	pkill -f "node .*Common/FrontEnd/qwirkle/node_modules/.bin/vite preview --port=$(FRONT_END_PORT)"
	
clean:
	rm -rf dist node_modules Common/FrontEnd/qwirkle/dist Common/FrontEnd/qwirkle/node_modules
	pkill -f "node .*Common/FrontEnd/qwirkle/node_modules/.bin/vite preview --port=$(FRONT_END_PORT)"