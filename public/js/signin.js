// Toggle password visibility
document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = (inputId, toggleButtonId) => {
      const passwordInput = document.getElementById(inputId);
      const toggleButton = document.getElementById(toggleButtonId);

      toggleButton.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleButton.classList.toggle('fa-eye-slash');
        toggleButton.classList.toggle('fa-eye');
      });
    };

    togglePassword('password', 'togglePassword');
    togglePassword('reset-password', 'toggleResetPassword');
    togglePassword('confirm-password', 'toggleConfirmPassword');
  });

  // Open and close reset password modal
  function openResetPasswordModal() {
    document.getElementById('reset-password-modal').style.display = 'block';
  }

  function closeResetPasswordModal() {
    document.getElementById('reset-password-modal').style.display = 'none';
  }