$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');
    let eventsSource = $("#sidebar-event-template").html();
    let eventsTemplate = Handlebars.compile(eventsSource);
    let defaultData = "";
    //GET request to load filtered by category events into dropdown
    $.getJSON("http://52.53.72.98/api/v1/event-categories", function(data){
        let categDropSource = $("#category-dropdown-template").html();
        let categDropTemplate = Handlebars.compile(categDropSource);
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
        let categNames = document.getElementsByClassName("categName");
        let dropdownBarText = document.getElementById('categ-dropdown-text');
        $.each(categNames, function(i, item ){
            item.addEventListener("click",function(){filterDateByCategory(item.innerHTML)});
        })
    });

    //Setting up datalist with searhbox
    var inputBox = document.getElementById('search-input');
    let list = document.getElementById('searchList');
    var dataObj = ""
    //Detecting a key change in search and capturing it as "e"
    inputBox.onkeyup = function(e){
        console.log("INPUT BOX VALUE" + inputBox.value);
        console.log(e);
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
