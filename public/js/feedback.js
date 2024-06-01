document.addEventListener("DOMContentLoaded", function () {
    const section = document.querySelector(".feedback-box");
    const showBtn = document.querySelector("h1");
    const stars = document.querySelectorAll(".stars i");
    const submitBtn = document.querySelector(".btn button");
    const popup = document.getElementById("popup");

    showBtn.addEventListener("click", function () {
        section.classList.toggle("active");
    });

    stars.forEach(function (star, index1) {
        star.addEventListener("click", function () {
            stars.forEach(function (star, index2) {
                index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
            });
            enableSubmit(); // Enable submit button when star rating is clicked
        });
    });

    submitBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission
        if (!isRatingSelected()) {
            alert("Please rate your experience before submitting.");
        } else {
            openPopup(); // Open popup only if a star rating is selected
        }
    });

    function isRatingSelected() {
        const activeStars = document.querySelectorAll(".stars i.active");
        return activeStars.length > 0;
    }

    function enableSubmit() {
        submitBtn.disabled = false;
    }

    function openPopup() {
        if (isRatingSelected()) {
            popup.classList.add("open-popup");
        }
    }

    function closePopup() {
        popup.classList.remove("open-popup");
        clearFormInputs(); // Clear form inputs after closing popup
    }

    function clearFormInputs() {
        document.getElementById("feedbackForm").reset(); // Reset the form

        // Clear star ratings
        stars.forEach(function (star) {
            star.classList.remove("active");
        });
    }

    // Add event listener to "OK" button in popup
    document.querySelector("#popup button").addEventListener("click", function () {
        closePopup(); // Close popup and clear form inputs when "OK" is clicked
    });

});