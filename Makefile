##################      LOCAL DEVELOPMENT (Frontend Only)     ##################

# Run a dev server. Navigate to http://localhost:4200/
# The app will automatically reload if you change any of the source files.
dev:
	ng serve --proxy-config proxy.conf.json

# Bundle code for production.
prod:
	docker build .

prod-test:
	docker build . --build-arg OPTIMIZE_BUILD=0

unit-test:
	echo "Success."

init:
	git config core.hooksPath .githooks

# Install dependencies
install: init
	yarn install
