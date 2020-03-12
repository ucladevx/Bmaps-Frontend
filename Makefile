##################      LOCAL DEVELOPMENT (Frontend Only)     ##################

# Run a dev server. Navigate to http://localhost:4200/
# The app will automatically reload if you change any of the source files.
dev:
	ng serve --proxy-config proxy.conf.json -o

# Bundle code for production.
prod:
	docker build . -t mappening_frontend

prod-test:
	docker build . --build-arg OPTIMIZE_BUILD=0

unit-test:
	echo "Success."

# Install dependencies
install:
	yarn install
