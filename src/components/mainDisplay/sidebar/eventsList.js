import React from 'react'
import { Link } from 'react-router-dom'

const EventsList = (props) => {


    const list = ({allEvents}) => {
        console.log("haha")
        console.log(allEvents)
        if (allEvents){
            return allEvents.map((item)=>{
                const style = {
                        background:`url('/images/covers/${item.cover}.jpg') no-repeat`
                    }
                return (
                    <Link key={item.id} to={`/artist/${item.id}`}
                        className="artist_item"
                        style={style}>
                        <div>{item.name}</div>
                    </Link>
                )
            })
        }

    }
    return (
        <div className="eventsList">
            <h4>Browse the events</h4>
            {list(props)}
            <div>hahah</div>
        </div>
    )
}

export default EventsList;
