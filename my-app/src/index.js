import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'

//COMPONENTs

import MapDisplay from './components/mapDisplay'

const App = () =>{
    return (
        <div>
            <MapDisplay/>
            <h1>Yess</h1>
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
