document.addEventListener("DOMContentLoaded", function() {
    const section = document.querySelector(".feedback-box");
    const showBtn = document.querySelector("h1");
    const stars = document.querySelectorAll(".stars i");

    showBtn.addEventListener("click", function() {
        section.classList.toggle("active");
    });

    stars.forEach(function(star, index1) {
        star.addEventListener("click", function() {
            stars.forEach(function(star, index2) {
                index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
            });
        });
    });
});

let popup = document.getElementById("popup");
function openPopup(){
    popup.classList.add("open-popup");
}

function closePopup(){
    popup.classList.remove("open-popup");
}