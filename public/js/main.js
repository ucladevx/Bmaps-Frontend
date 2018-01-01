$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');
    var eventsSource = $("#sidebar-event-template").html();
    var eventsTemplate = Handlebars.compile(eventsSource);
    var categDropSource = $("#category-dropdown-template").html();
    var categDropTemplate = Handlebars.compile(categDropSource);
    var defaultData = "";

    //GET request to load filtered by category events into sidebar
    $.getJSON("http://52.53.72.98/api/v1/event-categories", function(data){
        let dropdownBarText = "";
        //Filters sidebar with either stored default events or filtered events from API
        function filterCategory(categoryName){
            if (categoryName == "all categories"){
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
            $(dropdownBarText).html(categoryName+"&nbsp;<span class=caret></span>");
        }
        //Add default option to categories object
        data.categories.unshift({"category":"all categories"});
        $.each(data.categories, function(i,item){
            item.category = item.category.toLowerCase();
        });
        //Mount categories object into dropdown using handlebars
        $('#categ-dropdown-mount').html(categDropTemplate({
            categDrop: data.categories
        }));
        //Capture all elements of CategoryName and add onclick to update sidebar
        var categNames = document.getElementsByClassName("categName");
        dropdownBarText = document.getElementById('categ-dropdown-text');
        console.log("dropdownbarText" + dropdownBarText.innerHTML);
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
        $("#nav-non-collapse").addClass("pull-left");
      } else {
        // window width is less than 500px
        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");
      }
    }
}); // close document ready function
