document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".container form");

    contactForm.addEventListener("submit", (e) => {
        if (!validateForm(contactForm)) {
            e.preventDefault();  // Prevent form submission if validation fails
        } else {
            // Add the query parameter to the form action
            contactForm.action += '?submitted=true';
        }
    });

    const allFields = document.querySelectorAll("input, textarea");
    allFields.forEach((field) => {
        field.addEventListener("input", () => {
            removeError(field);
        });
    });

    const accordionContent = document.querySelectorAll(".accordion-content");
    accordionContent.forEach((item, index) => {
        const header = item.querySelector("header");
        header.addEventListener("click", () => {
            item.classList.toggle("open");
            const desc = item.querySelector(".desc");
            if (item.classList.contains("open")) {
                desc.style.height = `${desc.scrollHeight}px`;
                item.querySelector("i").classList.replace("fa-plus", "fa-minus");
            } else {
                desc.style.height = "0px";
                item.querySelector("i").classList.replace("fa-minus", "fa-plus");
            }
            closeOtherAccordions(index);
        });
    });

    function closeOtherAccordions(currentIndex) {
        accordionContent.forEach((item, index) => {
            if (currentIndex !== index) {
                item.classList.remove("open");
                item.querySelector(".desc").style.height = "0px";
                item.querySelector("i").classList.replace("fa-minus", "fa-plus");
            }
        });
    }

    function validateForm(form) {
        let valid = true;

        const name = form.querySelector(".name");
        const message = form.querySelector(".message");
        const email = form.querySelector(".email");

        if (!name.value.trim()) {
            giveError(name, "Please enter your name");
            valid = false;
        }
        if (!message.value.trim()) {
            giveError(message, "Please enter a message");
            valid = false;
        }
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email.value.trim())) {
            giveError(email, "Please enter a valid email");
            valid = false;
        }

        return valid;
    }

    function giveError(field, message) {
        const parentElement = field.parentElement;
        parentElement.classList.add("error");
        let existingError = parentElement.querySelector(".err-msg");
        if (existingError) {
            existingError.textContent = message;
        } else {
            const error = document.createElement("span");
            error.textContent = message;
            error.classList.add("err-msg");
            parentElement.appendChild(error);
        }
    }

    function removeError(field) {
        const parentElement = field.parentElement;
        parentElement.classList.remove("error");
        let error = parentElement.querySelector(".err-msg");
        if (error) {
            error.remove();
        }
    }

    // Search form handling
    const searchForm = document.getElementById("searchForm");

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = document.getElementById("searchInput").value.trim();
        if (query) {
            window.location.href = `/helpdesk/search?query=${encodeURIComponent(query)}`;
        }
    });

    // Check for query parameter and show alert
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        
        if (!validateForm(contactForm)) {
            return; // Exit function early if form validation fails
        }
        
        // Submit the form data via AJAX instead of a regular form submission
        try {
            const formData = new FormData(contactForm);
            const response = await fetch('/helpdesk', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Display the alert message
                alert("Your message has been submitted successfully!");
                // Reset the form
                contactForm.reset();
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while submitting the form. Please try again later.");
        }
    });

});