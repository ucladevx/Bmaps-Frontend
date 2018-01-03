$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');
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
}); // close document ready function
