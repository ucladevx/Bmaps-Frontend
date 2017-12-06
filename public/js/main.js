$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');
    var eventsSource = $("#sidebar-event-template").html();
    var eventsTemplate = Handlebars.compile(eventsSource);
    var searchSource = $("#search-results-template").html();
    var searchResultsTemplate = Handlebars.compile(searchSource);
    //Make a get request to the events to load them into the sidebar using handlebars
    var defaultData = ""

    $.getJSON("http://52.53.72.98/api/v1/events", function(data)
    {
        // console.log(data);
        var html = ''; // we declare the variable that we'll be using to store our information
        var counter = 1; // we declare a counter variable to use with the if statement in order to limit the result to 1

        //iterate through each of the elements in the API json object
        $.each(data.features, function(i,item){
            formatDateItem(item);
        });

        defaultData = data.features;
        Handlebars.registerHelper('json', function(context) {
            return JSON.stringify(context).replace(/"/g, '&quot;');
        });

        Handlebars.registerHelper('fullName', function(person) {
          return person.firstName + " " + person.lastName;
        });

        //Mount the object holding events into the index.html at #events-mount
        $('#events-mount').html(eventsTemplate({
            events: data.features
        }));

        initModal();


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
    let icon = document.getElementById('searchIcon');
    console.log(icon);

    var dataObj = ""
    //Detecting a key change in search and capturing it as "e"
    inputBox.onkeyup = function(e){
        console.log("INPUT BOX VALUE" + inputBox.value);
        console.log(e);

        function mountSearchResults(){
            if (inputBox.value == "") {
                $('#events-mount').html(eventsTemplate({
                    events: defaultData
                }));
            }
            else {
                $('#events-mount').html(eventsTemplate({
                    events: dataObj
                }));
            }
            return false;
        }

        //Search icon will also cause mounting
        icon.addEventListener("click",function(){mountSearchResults()});
        //13 is the code value for `Enter` (74: j)
        if (e.which == 13){
            mountSearchResults();
        }
        //Pass the current keys into the search API
        var keyUrl = "http://52.53.72.98/api/v1/search/"+inputBox.value;
        $.getJSON(keyUrl, function(data){
            //Clear the list and restart everytime we get a new input
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
            //Iterate through all of the elemnts given by the API search
            $.each(data.features, function(i,item){
                formatDateItem(item);
                if (i < 15){
                    console.log(item.properties.event_name);
                    //Append those elements onto the datalist for the input box
                    let option = document.createElement('option');
                    option.value = item.properties.event_name;
                    list.appendChild(option);
                }
            });
            dataObj = data.features;
        })
    }
    // media query event handler
    if (matchMedia) {
      const mq = window.matchMedia("(min-width: 767px)");
      mq.addListener(WidthChange);
      WidthChange(mq);
    }

    // media query change
    function WidthChange(mq) {
      if (mq.matches) {
        // window width is at least 500px
        $(".sidebar-mount").appendTo("#regular-mount");
        $("#map").appendTo("#regular-mount");
        $("#nav-non-collapse").removeClass("pull-right");
        $("#nav-non-collapse").addClass("pull-left");
      } else {
        // window width is less than 500px
        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");
        $("#nav-non-collapse").addClass("pull-right");
      }
    }
}); // close document ready function
