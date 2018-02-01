ECR_REPO=698514710897.dkr.ecr.us-west-1.amazonaws.com
APP_NAME=mappening/frontend

##########################      AWS / PRODUCTION      ##########################

# Authenticate Docker client
ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

# Build frontend image
build:
	docker build . -t $(APP_NAME)

# Login, build, and push latest image to AWS
push: ecr-login build
	docker tag $(APP_NAME):latest $(ECR_REPO)/$(APP_NAME):latest
	docker push $(ECR_REPO)/$(APP_NAME):latest

##################      LOCAL DEVELOPMENT (Frontend Only)     ##################

# Build and run frontend image
dev: build
	docker run --rm --name frontend-dev -v $(shell pwd)/static:/tmp/static -p "80:80" -it $(APP_NAME)

# Enter frontend container
ash:
	docker exec -it frontend-dev /bin/ash

# Update changes made to static files
files:
	./node_modules/gulp/bin/gulp.js && cp -r dist/* /app/ && cp -r static/* /app/
