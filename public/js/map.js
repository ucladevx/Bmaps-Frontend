////////////////////////////////////////////////
///////////////////// MAP //////////////////////
////////////////////////////////////////////////
// Buildings Tileset: trinakat.cjasdkzxp4sg333mhtqv9vugy-7iaym

mapboxgl.accessToken = 'pk.eyJ1IjoidHJpbmFrYXQiLCJhIjoiY2phczZjMDRoNG9lMTMxbnEzMnAyemtqMyJ9.9BNijLx_oyyU2LmboUczTw'; // 'pk.eyJ1IjoiaGVsYXJhYmF3eSIsImEiOiJjajUxN3k2d3MwMGg4MnFxZHhjcjYxN2U4In0.0OSl71QURA_P9d32r982Zw';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/trinakat/cjasrg0ui87hc2rmsomilefe3', // UCLA Campus Buildings (restricted by the border)
  // 'mapbox://styles/trinakat/cjashcgwq7rfo2srstatrxhyi', // UCLA Buildings
  // 'mapbox://styles/helarabawy/cj9tlpsgj339a2sojau0uv1f4',
	center: [-118.445320, 34.066915],
  maxBounds: [[-118.46, 34.056],[-118.428, 34.079]],
	zoom: 15,
	pitch: 60
});


////////////////////////////////////////////////
//////////////// DATE HANDLING //////////////////
////////////////////////////////////////////////

var today = new Date(); //this is being changed somewhere and I can't figure out where
var todayD = today.getDate();
var todayM = today.getMonth(); //January is 0!
var todayY = today.getFullYear();

let todayDate = new Date();
let milliDay = 86400000;

var d = todayD;
var m = todayM;
var y = todayY;

var currDay = today;

function nextDay() {
  currDay.setDate(currDay.getDate() + 1);
  d = currDay.getDate();
  m = currDay.getMonth();
  updateDate();
}

function previousDay() {
  currDay.setDate(currDay.getDate() - 1);
  d = currDay.getDate();
  m = currDay.getMonth();
  updateDate();
}

function updateDate() {
  filterDayInSidebar();
    if (todayDate.getTime() == currDay.getTime()) {
      document.getElementById("leftArrow").style.display = "none";
      document.getElementById("rightArrow").style.display = "inline";
      document.getElementById("relativeDay").innerHTML =  "today";
    }
	else {
      if (currDay.getTime() == (todayDate.getTime() + milliDay)) {
        document.getElementById("relativeDay").innerHTML =  "tomorrow";
	} else if (currDay.getTime() == (todayDate.getTime() + 7*milliDay)) {
        document.getElementById("relativeDay").innerHTML = "in a week";
        document.getElementById("rightArrow").style.display = "none";
      } else {
        document.getElementById("relativeDay").innerHTML = ((currDay.getTime()-todayDate.getTime())/milliDay) +" days from today";
      }
      document.getElementById("leftArrow").style.display = "inline";
    }

    document.getElementById("currDate").innerHTML =  (getMonthNameFromMonthNumber(m) + " " + d).toLowerCase();
    // update source
     map.getSource('events').setData('http://52.53.72.98/api/v1/event-date/' + d + '%20' + getMonthNameFromMonthNumber(m)+ '%20' + y);
     // map.getSource('events').setData('http://52.53.72.98/api/v1/event-date/12%20Dec%202017');
}


////////////////////////////////////////////////
/////////////////// LOAD DATA //////////////////
////////////////////////////////////////////////

var events = 'http://52.53.72.98/api/v1/event-date/' + d +' ' + getMonthNameFromMonthNumber(m); // json we are pulling from for event info
map.on('load', function () {
    map.addSource('events', { type: 'geojson', data: events });
    // Making layers (based on categorization)
  /*  events.features.forEach(function(feature) {
            var symbol = features.properties.category; // category name -> icon
            var layerID = 'poi-' + symbol;
            // Add a layer for this symbol type if it hasn't been added already.
            if (!map.getLayer(layerID)) {
                map.addLayer({
                    "id": layerID,
                    "type": "symbol",
                    "source": "events",
                    "layout": {
                        "icon-image": "/icons/" + symbol + ".svg",
                        "icon-allow-overlap": true
                    },
                    "filter": ["==", "icon", symbol]
                });
            }
        });*/
  /* REVERT TO THIS IF categorization does not work*/

  /**** map.addLayer({
        "id": "eventlayer",
        "type": "symbol",
        "source": "events",
        "layout": {
            "icon-image": "triangle-15",
            "icon-size": 2.3,
            "icon-allow-overlap": true
        }
    }); */

    map.loadImage('https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png', function(error, image) {
        if (error) throw error;
        map.addImage('pin', image);
        map.addLayer({
            "id": "eventlayer",
            "type": "symbol",
            "source":"events",
            "layout": {
                "icon-image": "pin",
                "icon-size":.06,
                "icon-allow-overlap": true

            }
        });
    });
});


////////////////////////////////////////////////
///////////////// MAP CONTROLS /////////////////
////////////////////////////////////////////////

map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    fitBoundsOptions: {maxZoom: 17.7, speed: .3},
    trackUserLocation: true
}));
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

////////////////////////////////////////////////
///////////// 3D DISPLAY BUILDINGS /////////////
////////////////////////////////////////////////

function threeDDisplay() {
   // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers.reverse();
    var labelLayerIdx = layers.findIndex(function (layer) {
        return layer.type !== 'symbol';
    });
    map.addLayer({
        'id': 'ucla-buildings',
        'source': 'composite',
        'source-layer': 'UCLA_Campus_Buildings', // UCLA Campus Buildings
        // 'source-layer': 'UCLA_Buildings', // UCLA Buildings
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'property': 'height',
                'type': 'identity'
            },
            'fill-extrusion-base': {
                'property': 'min_height',
                'type': 'identity',
            },
            // 'fill-extrusion-height': 20,
            // 'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.5
        }
    }, "eventstest");
}

////////////////////////////////////////////////
///////////// HOVER POPUP WHEN HOVER ///////////
////////////////////////////////////////////////

function hoverPopup() {
  // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: {'bottom':[15,0]}
    });

    map.on('mouseenter', 'eventlayer', function(e) {
         // Change the cursor style as a UI indicator.
         map.getCanvas().style.cursor = 'pointer';
         // Populate the popup and set its coordinates
         // based on the feature found.
         popup.setLngLat(e.features[0].geometry.coordinates)
             .setHTML('<p id=popupEvent></p> <p id=popupDate></p>')
             .addTo(map);

        document.getElementById('popupEvent').innerHTML =  e.features[0].properties.event_name ;
        document.getElementById('popupDate').innerHTML = formatDate(new Date(e.features[0].properties.start_time));
     });
     map.on('mouseleave', 'eventlayer', function() {
         map.getCanvas().style.cursor = '';
         popup.remove();
     });
     map.on('click', 'eventlayer', function (e) {
       map.flyTo({center: e.lngLat, zoom: 17, speed: .3});
       // console.log(e);
       // console.log(e.features);
       // console.log(e.features[0]);
       // console.log(e.features[0].properties)
    //   showModal('sign-up', e.properties);
      formatDateItem(e.features[0]);
      console.log(e.features[0]);
      showModal('sign-up', e.features[0]);
   });
}

////////////////////////////////////////////////
/////////////// START UP THE MAP ///////////////
////////////////////////////////////////////////

function startMap() {
	threeDDisplay();
	map.flyTo({center: [-118.445320, 34.066915], zoom: 15.8, speed: .15});
	setTimeout(function() {map.setPaintProperty('ucla-buildings', 'fill-extrusion-opacity', .6);}, 2100);

  document.getElementById("leftArrow").innerHTML = "&#9664;";
  document.getElementById("rightArrow").innerHTML = "&#9658;";
  updateDate();


}
map.on('load', startMap);
map.on('load', hoverPopup);

////////////////////////////////////////////////
////// NAVIGATING MAP W GAME-LIKE CONTROLS /////
////////////////////////////////////////////////

	  // pixels the map pans when the up or down arrow is clicked
    var deltaDistance = 100;

    // degrees the map rotates when the left or right arrow is clicked
    var deltaDegrees = 25;

    var deltaZoom = .5;

    function easing(t) {
        return t * (2 - t);
    }
    map.on('load', function() {
        map.getCanvas().focus();
        map.getCanvas().addEventListener('keydown', function(e) {
            e.preventDefault();
            if (e.which === 38) { // up
                map.panBy([0, -deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 40) { // down
                map.panBy([0, deltaDistance], {
                    easing: easing
                });
            } else if (e.which === 37) { // left
                map.easeTo({
                    bearing: map.getBearing() - deltaDegrees,
                    easing: easing
                });
            } else if (e.which === 39) { // right
                map.easeTo({
                    bearing: map.getBearing() + deltaDegrees,
                    easing: easing
                });
            } else if (e.which === 32) { // zoom in (space)
                map.easeTo({
                    zoom: map.getZoom() + deltaZoom,
                    easing: easing
                });
            } else if (e.which === 8) { // zoom out (backspace)
                map.easeTo({
                    zoom: map.getZoom() - deltaZoom,
                    easing: easing
                });
           }
        }, true);
    });

////////////////////////////////////////////////
//////// SIDEBAR EVENT ONCLICK FUNCTION ////////
////////////////////////////////////////////////

function zoomToEventLocation(x, y) {
  map.flyTo({center: [x, y], zoom: 17, speed: .85});
}
