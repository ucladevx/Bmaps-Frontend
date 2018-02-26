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

// var initEvents = function(){
//     $('#left-chevron').click(function(){
//         console.log("CLICKED!!!!!!!!!!!!!!!!");
//         hideEvent();
//     });
// };
// initEvents();

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
    } else {
        // window width is less than 767px
        $(".sidebar-mount").appendTo("#mobile-mount");
        $("#nav-non-collapse").removeClass("pull-left");
    }
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context).replace(/"/g, '&quot;');
    });
}; // close document ready function