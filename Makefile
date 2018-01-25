ECR_REPO=698514710897.dkr.ecr.us-west-1.amazonaws.com
APP_NAME=frontend

ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

build:
	docker build . -t mappening/$(APP_NAME)

push: ecr-login build
	docker tag $(APP_NAME):latest $(ECR_REPO)/$(APP_NAME):latest
	docker push $(ECR_REPO)/$(APP_NAME):latest

dev:
	docker run --rm --name frontend-dev -v $(shell pwd)/static:/tmp/static -p "80:80" -it mappening/frontend

ash:
	docker exec -it frontend-dev /bin/ash

files:
	./node_modules/gulp/bin/gulp.js && cp -r dist/* /app/
