let initialZoom;
$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');

    //Setting up datalist with searchBox
    let inputBox = document.getElementById('search-input');
    let leftIcon = document.getElementById("mobile-left-icon");
    let searchForm = document.getElementById('searchForm');
    let searchIcon = document.getElementById('searchIcon');
    let mobileSearchIcon = document.getElementById('mobileSearchIcon');

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
        $(mobileSearchIcon).addClass("no-display");
        navbar.style.background = "linear-gradient(#43576B, #8296A1)";
        inputBox.setAttribute("style", "display: inline-table;");
        searchIcon.setAttribute("style", "display: block");
        // $(searchIcon).off("click");
      } else {
        // window width is less than 767px

        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");

        //When inputBox is clicked: will expand all other nav elements will have no display
        $(mobileSearchIcon).removeClass("no-display");
        inputBox.setAttribute("style", "display: none;");
        searchIcon.setAttribute("style", "display: none");
        $(mobileSearchIcon).click(function() {
            $(midUl).removeClass("pull-right");
            $(navHeader).addClass("no-display");
            $(navToggle).addClass("no-display");
            $(leftIcon).removeClass("no-display");
            $(mobileSearchIcon).addClass("no-display");
            navbar.style.background = "white";
            inputBox.setAttribute("style", "display: inline-table;");
            searchIcon.setAttribute("style", "display: block");
        });
        //When leftIcon is clicked: restore mobile navbar display
        $(leftIcon).click(function(){
            $(midUl).addClass("pull-right");
            $(navHeader).removeClass("no-display");
            $(navToggle).removeClass("no-display");
            $(leftIcon).addClass("no-display");
            $(mobileSearchIcon).removeClass("no-display");
            navbar.style.background = "linear-gradient(#43576B, #8296A1)";
            inputBox.setAttribute("style", "display: none;");
            searchIcon.setAttribute("style", "display: none;");
        });
      }
    }
}); // close document ready function
