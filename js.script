/* =========================
VELO MAIN SCRIPT
========================= */

/* MENU */

function openMenu() {
document.getElementById("sidebar").style.left = "0";
document.getElementById("overlay").style.display = "block";
}

function closeMenu() {
document.getElementById("sidebar").style.left = "-320px";
document.getElementById("overlay").style.display = "none";
}

/* AUTO SLIDER */

const slider = document.querySelector(".card-slider");

let scrollAmount = 0;

function autoSlide() {

if (!slider) return;

scrollAmount += 320;

if (
scrollAmount >=
slider.scrollWidth -
slider.clientWidth
) {
scrollAmount = 0;
}

slider.scrollTo({
left: scrollAmount,
behavior: "smooth"
});

}

setInterval(autoSlide, 4000);

/* SMOOTH BUTTONS */

document.querySelectorAll("a").forEach(link => {

link.addEventListener("click", function() {

document.body.style.opacity = "0.96";

setTimeout(() => {

document.body.style.opacity = "1";

}, 300);

});

});

/* SIMPLE PRELOADER EFFECT */

window.addEventListener("load", () => {

document.body.classList.add("loaded");

});

/* HERO FADE */

const hero = document.querySelector(".hero");

window.addEventListener("scroll", () => {

let value = window.scrollY;

if(hero){

hero.style.opacity =
1 - value / 900;

}

});

/* LOGO FLOAT */

const logo = document.querySelector(".velo-logo");

if(logo){

setInterval(() => {

logo.classList.toggle("float");

}, 2000);

}

/* =========================
IMAGE FALLBACK
========================= */

document.querySelectorAll("img").forEach(img => {

img.onerror = function(){

this.src = "images/placeholder.jpg";

};

});

/* =========================
CARD DRAG SLIDER
========================= */

const sliderContainer =
document.querySelector(".card-slider");

if(sliderContainer){

let isDown = false;
let startX;
let scrollLeft;

sliderContainer.addEventListener("mousedown",(e)=>{
isDown = true;
startX = e.pageX - sliderContainer.offsetLeft;
scrollLeft = sliderContainer.scrollLeft;
});

sliderContainer.addEventListener("mouseleave",()=>{
isDown = false;
});

sliderContainer.addEventListener("mouseup",()=>{
isDown = false;
});

sliderContainer.addEventListener("mousemove",(e)=>{
if(!isDown) return;

e.preventDefault();

const x = e.pageX - sliderContainer.offsetLeft;
const walk = (x - startX) * 2;

sliderContainer.scrollLeft =
scrollLeft - walk;

});

}

/* =========================
ACTIVE PAGE HIGHLIGHT
========================= */

const currentPage =
window.location.pathname.split("/").pop();

document.querySelectorAll("a").forEach(link=>{

const linkPage =
link.getAttribute("href");

if(linkPage === currentPage){

link.style.color = "#d4af37";

}

});
