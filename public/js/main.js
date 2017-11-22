$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    var source = $("#sidebar-event-template").html();
    var template = Handlebars.compile(source);
    //Make a get request to the events to load them into the sidebar using handlebars
    $.getJSON("http://52.53.197.64/api/v1/events", function(data)
    {
        //iterate through each of the elements in the API json object
        $.each(data.features, function(i,item){
            console.log(item.properties.event_name);
        });
        //Mount the object holding events into the index.html at #events-mount
        $('#events-mount').append(template({
            events: data.features
        }));

        //OLD CODE THAT MAY BE USEFUL IN THE FUTURE
        // var html = ''; // we declare the variable that we'll be using to store our information
        // var counter = 1; // we declare a counter variable to use with the if statement in order to limit the result to 1
        // $.each(data.recenttracks.track, function(i, item) {
        //     if(counter == 1) {
        //         songTitle = item.name;
        //         artist = item.artist['#text'];
        //         html += 'Currently listening to: <span><a href="' + item.url + '" target="_blank">' + songTitle + '</a> - ' + artist + '</span>';
        //         console.log("haha" + html);
        //         console.log(songTitle);
        //     } // close the if statement
        //     counter++ // add 1 to the counter variable each time the each loop runs
        // }); // close each loop
        //
        // $('.listening-to h5').append(html); // print the information to the document - here I look for the h5 tag inside the div with a class of 'listening-to' and use the jQuery append method to insert the information we've stored in the html variable inside the h5 tag.
        //
        // songTitle2 = songTitle.split(' ').join('%20');
        // artist2 =  artist.split(' ').join('%20');
        //
        // songhtml = "https://api.spotify.com/v1/search?q=track:" + songTitle2 + "%20artist:" + artist2 + "&limit=1&type=track"
        // console.log("wassup");
        // console.log(songhtml);
        // $.getJSON(songhtml, function(data){
        //
        //     $.each(data.tracks.items, function(i, item){
        //         id = item.id;
        //         console.log(id);
        //     });
        //
        //     var iframeSrc = "https://embed.spotify.com/?uri=spotify:track:" + id
        //     console.log(iframeSrc);
        //     var embedHtml = '<iframe src="' + iframeSrc + '" frameborder="0" allowtransparency="true"></iframe>';
        //     console.log(embedHtml);
        //     $('.showSong').append(embedHtml);
        //
        // });
    });
    //Setting up datalist with searhbox
    var inputBox = document.getElementById('search-input');
    let list = document.getElementById('searchList');
    //Detecting a key change in search and capturing it as "e"
    inputBox.onkeyup = function(e){
        console.log(inputBox.value);
        console.log(e);
        //13 is the code value for `Enter`
        if (e.which == 13){
            e.preventDefault(); //currently does nothing
            $('.input-group-addon').click();
        }
        //Pass the current keys into the search API
        var keyUrl = "http://52.53.197.64/api/v1/search/"+inputBox.value;
        $.getJSON(keyUrl, function(data){
            //Clear the list and restart everytime we get a new input
            while (list.firstChild) {
                list.removeChild(myNode.firstChild);
            }
            console.log(data);
            //Iterate through all of the elemnts given by the API search
            $.each(data, function(i,item){
                console.log(item.event_name);
                //Append those elements onto the datalist for the input box
                let option = document.createElement('option');
                option.value = item.event_name;
                list.appendChild(option);
            });
        })
    }
}); // close document ready function
