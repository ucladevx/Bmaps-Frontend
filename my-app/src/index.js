import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";
import MapboxGL from 'mapbox-gl'

//COMPONENTs
import MapDisplay from './components/mapDisplay'

// // ES5
// var Layer = ReactMapboxGl.Layer;
// var Feature = ReactMapboxGl.Feature;

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoidGFuemVlbGEiLCJhIjoiY2o5OTh0enVlMHBtNjMybHM1a2FxZjd6NCJ9.BluyLPr5_3NWWF9dMwkmvA"
});

const App = () =>{
    return (
        <div>
            <Map
              style="mapbox://styles/mapbox/streets-v9"
              containerStyle={{
                height: "100vh",
                width: "100vw"
              }}>
                <Layer
                  type="symbol"
                  id="marker"
                  layout={{ "icon-image": "marker-15" }}>
                  <Feature coordinates={[-0.481747846041145, 51.3233379650232]}/>
                </Layer>
            </Map>
            <MapDisplay/>
            <h1>Yess</h1>
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
