document.addEventListener("DOMContentLoaded", function(event) {
    (function($) {window.fnames = new Array();
        window.ftypes = new Array();
        fnames[0]='EMAIL';
        ftypes[0]='email';
        fnames[1]='FNAME';
        ftypes[1]='text';
        fnames[2]='LNAME';
        ftypes[2]='text';
    }(jQuery));
    var $mcj = jQuery.noConflict(true);

//     console.log("Hello")
//
//     // JavaScript
//     // window.sr = ScrollReveal();
//     // console.log("yes");
//     // sr.reveal('.foo');
//     // console.log("pls");
//     // sr.reveal('.bar');
//
//     // interval passed to reveal
// window.sr = ScrollReveal({ duration: 2000 });
// console.log("da fuck")
// sr.reveal('.page-content', 50);


// showImage() {
//   var theImages = [ 'img/fun1.jpg', 'img/fun1.jpg', 'img/fun1.jpg', 'img/fun1.jpg', 'img/fun1.jpg' ];
//   var img = theImages[Math.round(Math.random() * (theImages.length - 1))];
//   document.getElementById('splash').innerHTML = '<img src="' + img + '">');
// }
//
// showImage();


window.onload = choosePic;

var myPix = new Array("img/fun1.jpg","img/fun2.jpg","img/fun3.jpg");

function choosePic() {
	randomNum = Math.floor((Math.random() * myPix.length));
	document.getElementById("myPicture").src = myPix[randomNum];
}
});
