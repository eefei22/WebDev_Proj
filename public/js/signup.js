//Toggle password visibility
document.addEventListener('DOMContentLoaded', function () {
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