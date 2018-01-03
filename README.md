# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`
Have nodemon installed with `npm install -g nodemon`

## Built With
* Mapbox: Open source mapping platform for custom designed maps
* Node.js: Javascript runtime built on Chrome
* Handlebars.js: Templating language that separates view and code

## How To Run
* `cd` to the repository.
* `npm install` to install packages.

* Check if backend is already deployed in AWS
    * Navigate to http://52.53.72.98/api/v1/events
    * If not running, run [Mappening-Backend](https://github.com/ucladevx/Mappening-Backend) locally according to the instructions in the README
        * Navigate to http://localhost/api/v1/events
        * Modify public/js/main.js
        * `$.getJSON("http://localhost/api/v1/events", function(data)`
* Run app with `nodemon`
    * Navigate to http://localhost:8000
