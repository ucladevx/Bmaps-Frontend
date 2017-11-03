import React, { Component } from 'react'
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";
import MapboxGL from 'mapbox-gl'

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoidGFuemVlbGEiLCJhIjoiY2o5OTh0enVlMHBtNjMybHM1a2FxZjd6NCJ9.BluyLPr5_3NWWF9dMwkmvA"
});

class MapDisplay extends Component {
    render() {
        return(
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

            </div>
        )
    }
}

export default MapDisplay;
