const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Do nothing if form not validated
    if (!validateForm(form)) return;

    //if form valid submit

    alert("Message successfully sent");

    resetFormFields(form);
})


// Function to reset the form fields
const resetFormFields = (form) => {
    form.reset();
};

const validateForm = (form) => {
    let valid = true;
    //Check for empty fields
    let name = form.querySelector(".name");
    let message = form.querySelector(".message");
    let email = form.querySelector(".email");

    if (name.value == "") {
        giveError(name, "Please enter your name");
        valid=false;
    }
    if (message.value == "") {
        giveError(message, "Please enter message");
        valid=false;
    }

    //emaill validation
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let emailValue = email.value;
    if (!emailRegex.test(emailValue)){
        giveError(email, "Please enter a valid email");
        valid=false;
    }

    //return true if valid
    if (valid){
        return true;
    }
};

const giveError = (field, message) => {
    let parentElement = field.parentElement;
    parentElement.classList.add("error");
    //if error message already exist remove it
    let existingError = parentElement.querySelector(".err-msg")
    if (existingError){
        existingError.remove();
    }
    let error = document.createElement("span")
    error.textContent = message;
    error.classList.add("err-msg");
    parentElement.appendChild(error);
};

// lets remover error on input

const inputs = document.querySelectorAll("input");
const textareas = document.querySelectorAll("textarea");

let allFields = [...inputs, ...textareas];

allFields.forEach((field) => {
    field.addEventListener("input", () => {
        removeError(field);
    });
});

const removeError = (field) => {
    let parentElement = field.parentElement;
    parentElement.classList.remove("error");
    let error = parentElement.querySelector(".err-msg");
    if (error){
        error.remove();
    }
};


// FAQ
const accordionContent = document.querySelectorAll(".accordion-content");
accordionContent.forEach((item, index) => {
    let header = item.querySelector("header");
    header.addEventListener("click", () => {
        item.classList.toggle("open");

        let desc = item.querySelector(".desc");
        if(item.classList.contains("open")){
            desc.style.height = `${desc.scrollHeight}px`;
            item.querySelector("i").classList.replace("fa-plus", "fa-minus");
        } else{
            desc.style.height = "0px"
            item.querySelector("i").classList.replace("fa-minus", "fa-plus");
        }
        removeOpen(index);
    })
})

function removeOpen(index1){
    accordionContent.forEach((item2, index2) => {
        if(index1 != index2){
            item2.classList.remove("open");

            let des = item2.querySelector(".desc");
            des.style.height = "0px";
            item2.querySelector("i").classList.replace("fa-minus", "fa-plus");
        }
    })
}