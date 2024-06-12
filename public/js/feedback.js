document.addEventListener("DOMContentLoaded", function () {
    // const showBtn = document.getElementById("openFeedbackBtn");
    const feedbackDialog = document.getElementById("feedbackDialog");
    const closeFeedbackBtn = document.getElementById("closeFeedbackBtn");
    const stars = document.querySelectorAll(".stars i");

    showBtn.addEventListener("click", function () {
        feedbackDialog.style.display = "block";
    });

    closeFeedbackBtn.addEventListener("click", function () {
        feedbackDialog.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target === feedbackDialog) {
            feedbackDialog.style.display = "none";
        }
    }

    stars.forEach(function (star, index1) {
        star.addEventListener("click", function () {
            stars.forEach(function (star, index2) {
                index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
            });
        });
    });
});

let popup = document.getElementById("popup");
function openPopup() {
    popup.classList.add("open-popup");
}

function closePopup() {
    popup.classList.remove("open-popup");
}