$(document).ready(function() {
    //After website is loaded, use handlebars to parse the html in the sidebar template in the index.html
    $('#searchForm').attr('action', 'javascript:void(0);');

    //Setting up datalist with searchBox
    var inputBox = document.getElementById('search-input');
    var leftIcon = document.getElementById("mobile-left-icon");
    var searchForm = document.getElementById('searchForm');
    var searchIcon = document.getElementById('searchIcon');
    var mobileSearchIcon = document.getElementById('mobileSearchIcon');

    // media query event handler
    if (matchMedia) {
      const mq = window.matchMedia("(min-width: 767px)");
      mq.addListener(WidthChange);
      WidthChange(mq);
    }

    // media query change
    function WidthChange(mq) {
        var navHeader = document.getElementById("navbar-brand-div")
        var midUl = document.getElementById("non-collapse-ul");
        var navToggle = document.getElementById("collapsed-menu");
        var navbar = document.getElementById("navbar");

      if (mq.matches) {
        // window width is at least 767px

        //Remount map+sidebar horizontally
        $(".sidebar-mount").appendTo("#regular-mount");
        $("#map").appendTo("#regular-mount");
        $("#nav-non-collapse").addClass("pull-left");

        //restore to default search display if not already
        // $(midUl).addClass("pull-right");
        // $(navHeader).removeClass("no-display");
        // $(navToggle).removeClass("no-display");
        // $(leftIcon).addClass("no-display");
        // $(mobileSearchIcon).addClass("no-display");
        // navbar.style.background = "linear-gradient(#43576B, #8296A1)";
        // inputBox.setAttribute("style", "display: inline-table;");
        // searchIcon.setAttribute("style", "display: block");
      } else {
        // window width is less than 767px
        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");

        // //When inputBox is clicked: will expand all other nav elements will have no display
        // $(mobileSearchIcon).removeClass("no-display");
        // inputBox.setAttribute("style", "display: none;");
        // searchIcon.setAttribute("style", "display: none");
        // $(mobileSearchIcon).click(function() {
        //     $(midUl).removeClass("pull-right");
        //     $(navHeader).addClass("no-display");
        //     $(navToggle).addClass("no-display");
        //     $(leftIcon).removeClass("no-display");
        //     $(mobileSearchIcon).addClass("no-display");
        //     navbar.style.background = "white";
        //     inputBox.setAttribute("style", "display: inline-table;");
        //     searchIcon.setAttribute("style", "display: block");
        // });
        // //When leftIcon is clicked: restore mobile navbar display
        // $(leftIcon).click(function(){
        //     $(midUl).addClass("pull-right");
        //     $(navHeader).removeClass("no-display");
        //     $(navToggle).removeClass("no-display");
        //     $(leftIcon).addClass("no-display");
        //     $(mobileSearchIcon).removeClass("no-display");
        //     navbar.style.background = "linear-gradient(#43576B, #8296A1)";
        //     inputBox.setAttribute("style", "display: none;");
        //     searchIcon.setAttribute("style", "display: none;");
        // });

      }
    }


}); // close document ready function
