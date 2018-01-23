build:
	docker build -t mappening/frontend .

dev:
	sudo docker run --rm --name frontend-dev -v $(shell pwd)/static:/tmp/static -p "80:80" -it mappening/frontend

ash:
	docker exec -it frontend-dev /bin/ash

files:
	./node_modules/gulp/bin/gulp.js && cp -r dist/* /app/
