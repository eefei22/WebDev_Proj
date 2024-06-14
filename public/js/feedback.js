document.addEventListener("DOMContentLoaded", function () {
    const feedbackDialog = document.getElementById("feedbackDialog");
    const openFeedbackDialog = document.getElementById("review_button");
    const closeFeedbackBtn = document.getElementById("closeFeedbackBtn");
    const stars = document.querySelectorAll(".stars i");
    const feedbackForm = document.getElementById("feedbackForm");

    // Function to open the feedback dialog
    function openFeedbackDialogFunc(event) {
        event.preventDefault(); // Prevent default behavior of the button

        // Get the advertisement ID from the data attribute
        const adId = openFeedbackDialog.getAttribute('data-ad-id');

        // Set the advertisement ID in the hidden input field
        const adIdInput = document.getElementById('adIdInput');
        if (adIdInput) {
            adIdInput.value = adId;
        } else {
            const newAdIdInput = document.createElement("input");
            newAdIdInput.type = "hidden";
            newAdIdInput.name = "adId";
            newAdIdInput.id = "adIdInput";
            newAdIdInput.value = adId;
            feedbackForm.appendChild(newAdIdInput);
        }

        feedbackDialog.style.display = "block";
    }

    // Function to close the feedback dialog
    function closeFeedbackDialogFunc() {
        feedbackDialog.style.display = "none";
    }

    // Event listener for opening the feedback dialog
    openFeedbackDialog.addEventListener("click", openFeedbackDialogFunc);

    // Event listener for closing the feedback dialog
    closeFeedbackBtn.addEventListener("click", closeFeedbackDialogFunc);

    // Event listener to close the feedback dialog if clicked outside the dialog
    window.onclick = function (event) {
        if (event.target === feedbackDialog) {
            closeFeedbackDialogFunc();
        }
    };

    // Event listener for star rating
    stars.forEach(function (star, index1) {
        star.addEventListener("click", function () {
            stars.forEach(function (star, index2) {
                index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
            });
        });
    });
});

