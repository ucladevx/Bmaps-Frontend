# BMaps-Frontend

## Setting Up the Environment

- Follow instructions in main [BMaps](https://github.com/ucladevx/BMaps) repository
- Install necessary packages to develop locally
  - Install yarn with `brew install yarn`
  - Import node modules with command `yarn` or `yarn install` or `make install`
    - Uses `package.json` for installing packages
    - Install specific packages as needed with `yarn add <package>`
    - Install Angular CLI with `yarn global add @angular/cli`
  - Notes:
    - Commit/keep `yarn.lock` file as it changes. `package.json` defines the intended versions of dependencies while the lock files keep track of the most recently used versions.
    - You shouldn't have a `package-lock.json`, because this corresponds to the `npm` package manager and our Frontend uses `yarn` as its package manager.

## How to Run Frontend Locally

- Run a dev server with `make dev`
  - Navigate to http://localhost:4200/ or use `make open`
  - The app will automatically reload if you change any of the source files.
