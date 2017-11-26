$(document).ready(function() {
    var source = $("#some-template").html();
    var template = Handlebars.compile(source);

    $.getJSON("http://52.53.197.64/api/v1/events", function(data)
    {

        //console.log("hellur");
        // console.log(data);
        var html = ''; // we declare the variable that we'll be using to store our information
        var counter = 1; // we declare a counter variable to use with the if statement in order to limit the result to 1

        $.each(data.features, function(i,item){
            //console.log(item.properties);
            //console.log(item.properties.event_name);

        });

        Handlebars.registerHelper('json', function(context) {
            return JSON.stringify(context).replace(/"/g, '&quot;');
        });

        Handlebars.registerHelper('fullName', function(person) {
          return person.firstName + " " + person.lastName;
        });

        $('#events-mount').append(template({
            events: data.features
        }));

        initModal();

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
}); // close document ready function
