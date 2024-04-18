document.addEventListener("DOMContentLoaded", function() {
    // Get the form element
    var form = document.getElementById("teachingProfileForm");

    // Function to validate minimum words for a textarea field
    function validateMinimumWords(textarea, minLength) {
        var words = textarea.value.trim().split(/\s+/).length;
        return words >= minLength;
    }

    // Add submit event listener to the form
    form.addEventListener("submit", function(event) {
        // Check subject selection
        var subject = form.querySelector('input[name="subject"]:checked');
        if (!subject) {
            alert("Please select a subject that you want to teach.");
            event.preventDefault();
            return;
        }

        // Validate minimum words for title
        var title = form.querySelector('#title');
        if (!validateMinimumWords(title, 12)) {
            alert("Title should have at least 12 words.");
            event.preventDefault();
            return;
        }

        // Validate minimum words for about lesson
        var aboutLesson = form.querySelector('#aboutlesson');
        if (!validateMinimumWords(aboutLesson, 20)) {
            alert("About lesson should have at least 20 words.");
            event.preventDefault();
            return;
        }

        // Validate minimum words for about me
        var aboutMe = form.querySelector('#aboutme');
        if (!validateMinimumWords(aboutMe, 20)) {
            alert("About me should have at least 20 words.");
            event.preventDefault();
            return;
        }

        var hourlyRate = document.getElementById("rate").value;

        // Check if the "Hourly rate" field is empty
        if (!hourlyRate) {
            // If empty, display an alert message
            alert("Please choose how much for one lesson");
            // Prevent form submission
            event.preventDefault();
        }

        // Check language selection
        var languages = form.querySelectorAll('input[name="language"]:checked');
        if (languages.length === 0) {
            alert("Please select at least one language spoken.");
            event.preventDefault();
            return;
        }

        // Check location selection
        var location = form.querySelector('#location');
        if (location.value === "") {
            alert("Please select your location.");
            event.preventDefault();
            return;
        }

        // Check mode selection
        var modeRadios = form.querySelectorAll('input[name="mode"]:checked');
        if (modeRadios.length === 0) {
            alert("Please select a lesson mode.");
            event.preventDefault();
            return;
        }

        // Check for teaching video file
        var video = form.querySelector('#video');
        if (video.value === "") {
            alert("Please upload a teaching video.");
            event.preventDefault();
            return;
        }

        // If all validations pass, redirect to the dashboard page
        window.location.href = 'dashboard.html';
        // Prevent default form submission
        event.preventDefault();
    });
});


   