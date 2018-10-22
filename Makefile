ECR_REPO=698514710897.dkr.ecr.us-west-1.amazonaws.com
APP_NAME=mappening/frontend
DEV_NAME=mappening/dev

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

#############################      AWS / DEV      ##############################

# Build backend image for dora
build-dora:
	docker build . -t $(DEV_NAME):dora

# Login, build, and push latest image to AWS for dev testing
dora: ecr-login build-dora
	docker tag $(DEV_NAME):dora $(ECR_REPO)/$(DEV_NAME):dora
	docker push $(ECR_REPO)/$(DEV_NAME):dora

##################      LOCAL DEVELOPMENT (Frontend Only)     ##################

# Run a dev server. Navigate to http://localhost:4200/ 
# The app will automatically reload if you change any of the source files.
dev: 
	ng serve

# Open whatever is currently running
open:
	ng serve --open

# Runs the docker container locally rather than the dev server.
# The app will be available at http://localhost:8080
dev-docker: build
	docker run -d -p 8080:80 $(APP_NAME)
