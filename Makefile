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

# TODO: DELETE EVERYTHING ABOVE THIS POINT
# Run a dev server. Navigate to http://localhost:4200/
# The app will automatically reload if you change any of the source files.
dev:
	ng serve

# Open whatever is currently running
open:
	ng serve --open
