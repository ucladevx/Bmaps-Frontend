##################      LOCAL DEVELOPMENT (Frontend Only)     ##################

# Run a dev server. Navigate to http://localhost:4200/
# The app will automatically reload if you change any of the source files.
dev:
	ng serve --proxy-config proxy.conf.json

# Install dependencies
install:
	yarn install
