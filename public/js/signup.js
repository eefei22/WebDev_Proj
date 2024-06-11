document.addEventListener('DOMContentLoaded', function () {
    //Alert message
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password'),
            userType: formData.get('userType')
        };

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(responseObject => {
            const { status, body } = responseObject;
            if (status === 200) {
                alert(body.message);
                window.location.href = "/login";
            } else {
                alert(body.message);
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('An unexpected error occurred. Please try again later.');
        });
    });

    //Toggle password visibility
    const passwordInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirm_password');
    const togglePasswordButton = document.getElementById('togglePassword');
    const toggleConfirmPasswordButton = document.getElementById('toggleConfirmPassword');

    togglePasswordButton.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Toggle eye icon based on password visibility
        togglePasswordButton.classList.toggle('fa-eye-slash');
        togglePasswordButton.classList.toggle('fa-eye');
    });

    toggleConfirmPasswordButton.addEventListener('click', function () {
        const type = confirmPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPassInput.setAttribute('type', type);
        // Toggle eye icon based on password visibility
        toggleConfirmPasswordButton.classList.toggle('fa-eye-slash');
        toggleConfirmPasswordButton.classList.toggle('fa-eye');
    });
});    
