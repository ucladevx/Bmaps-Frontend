import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'
// import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";
// import MapboxGL from 'mapbox-gl'

//COMPONENTs
// import MapDisplay from './components/mapDisplay'
import Home from './components/home';
// import EventBase from './components/event';

// const Map = ReactMapboxGl({
//   accessToken: "pk.eyJ1IjoidGFuemVlbGEiLCJhIjoiY2o5OTh0enVlMHBtNjMybHM1a2FxZjd6NCJ9.BluyLPr5_3NWWF9dMwkmvA"
// });

const App = () =>{
    return (

        <div>
            <BrowserRouter>
                <div>
                    <Route exact path="/" component={Home}/>
                </div>


            </BrowserRouter>

        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
