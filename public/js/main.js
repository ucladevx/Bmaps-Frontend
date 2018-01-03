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
    })

    //Setting up datalist with searchBox
    let inputBox = document.getElementById('search-input');
    let leftIcon = document.getElementById("mobile-left-icon");
    let searchIcon = document.getElementById('searchForm');

    // media query event handler
    if (matchMedia) {
      const mq = window.matchMedia("(min-width: 767px)");
      mq.addListener(WidthChange);
      WidthChange(mq);
    }

    // media query change
    function WidthChange(mq) {
        let navHeader = document.getElementById("navbar-brand-div")
        let midUl = document.getElementById("non-collapse-ul");
        let navToggle = document.getElementById("collapsed-menu");
        let navbar = document.getElementById("navbar");

      if (mq.matches) {
        // window width is at least 767px

        //Remount map+sidebar horizontally
        $(".sidebar-mount").appendTo("#regular-mount");
        $("#map").appendTo("#regular-mount");
        $("#nav-non-collapse").addClass("pull-left");

        //restore to default search display if not already
        $(midUl).addClass("pull-right");
        $(navHeader).removeClass("no-display");
        $(navToggle).removeClass("no-display");
        $(leftIcon).addClass("no-display");
        navbar.style.background = "rgb(251, 250, 250)";
        inputBox.setAttribute("style", "display: inline-table;");
        $(searchIcon).off("click");
      } else {
        // window width is less than 767px
        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");

        //When inputBox is clicked: will expand all other nav elements will have no display
        inputBox.setAttribute("style", "display: none;");
        $(searchIcon).click(function() {
            $(midUl).removeClass("pull-right");
            $(navHeader).addClass("no-display");
            $(navToggle).addClass("no-display");
            $(leftIcon).removeClass("no-display");
            navbar.style.background = "white";
            inputBox.setAttribute("style", "display: inline-table;");
        });
        //When leftIcon is clicked: restore mobile navbar display
        $(leftIcon).click(function(){
            $(midUl).addClass("pull-right");
            $(navHeader).removeClass("no-display");
            $(navToggle).removeClass("no-display");
            $(leftIcon).addClass("no-display");
            navbar.style.background = "rgb(251, 250, 250)";
            inputBox.setAttribute("style", "display: none;");
        });
      }
    }
}); // close document ready function
