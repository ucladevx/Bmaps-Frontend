# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`

## Built With
* React: javascript library for building user interfaces
* Node: javascript runtime built on Chrome

## How To Run
* `cd` to the repository.
* `npm install` to install packages. Install any necessary peer dependencies.
* Run dummy json server `json-server --watch db.json --port 3004`
    * Navigate to http://localhost:3004
* Or run Mappening-Backend and modify src/components/home.js
    * `const URL_ARTISTS = 'http://localhost:5000/events'`
* Run react app `npm start`
    * Navigate to http://localhost:8000
