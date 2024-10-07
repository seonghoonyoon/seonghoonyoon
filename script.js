var toggler = document.getElementsByClassName("caret");
var i;

for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("active");
        this.classList.toggle("caret-down");
    });
}

var toggler2 = document.getElementsByClassName("click");
var togglee = document.getElementsByClassName("item")
var i;

for (i = 0; i < toggler.length; i++) {
    toggler2[i].addEventListener("click", function() {
        togglee[i].parentElement.querySelector(".nested").classList.toggle("active");
        togglee[i].classList.toggle("caret-down");
    });
}