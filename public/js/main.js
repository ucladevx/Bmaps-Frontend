$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');
    var eventsSource = $("#sidebar-event-template").html();
    var eventsTemplate = Handlebars.compile(eventsSource);
    var categDropSource = $("#category-dropdown-template").html();
    var categDropTemplate = Handlebars.compile(categDropSource);
    var defaultData = ""

    //GET request to load filtered by category events into sidebar
    $.getJSON("http://52.53.72.98/api/v1/event-categories", function(data){
        //Filters sidebar with either stored default events or filtered events from API
        function filterCategory(categoryName){
            if (categoryName == "All"){
                $('#events-mount').html(eventsTemplate({
                    events: defaultData
                }));
            }
            else {
                let keyUrl = "http://52.53.72.98/api/v1/event-category/" + categoryName;
                $.getJSON(keyUrl,function(data){
                    $.each(data.features, function(i,item){
                        formatDateItem(item);
                    });
                    $('#events-mount').html(eventsTemplate({
                        events: data.features
                    }));
                })
            }
        }
        //Add default option to categories object
        data.categories.unshift({"category":"All"});
        $.each(data.categories, function(i,item){
            console.log(item.category);
        });
        //Mount categories object into dropdown using handlebars
        $('#categ-dropdown-mount').html(categDropTemplate({
            categDrop: data.categories
        }));
        //Capture all elements of CategoryName and add onclick to update sidebar
        var categNames = document.getElementsByClassName("categName");
        $.each(categNames, function(i, item ){
            item.addEventListener("click",function(){filterCategory(item.innerHTML)});
        })
    })

    //GET request to load events into the sidebar using handlebars
    $.getJSON("http://52.53.72.98/api/v1/events", function(data)
    {
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
    });
    //Setting up datalist with searhbox
    var inputBox = document.getElementById('search-input');
    let list = document.getElementById('searchList');
    var dataObj = ""
    //Detecting a key change in search and capturing it as "e"
    inputBox.onkeyup = function(e){
        console.log("INPUT BOX VALUE" + inputBox.value);
        console.log(e);
        //13 is the code value for `Enter` (74: j)
        if (e.which == 13){

            console.log("**DEFAULT DATA**");
            $.each(defaultData, function(i, item){
                console.log(item.properties.event_name);
            })
            console.log("**DATA OBJ**");
            $.each(dataObj, function(i, item){
                console.log(item.properties.event_name);
            })

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
        //Pass the current keys into the search API
        let keyUrl = "http://52.53.72.98/api/v1/search/"+inputBox.value;
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
}); // close document ready function
