document.addEventListener('DOMContentLoaded', function () {
  //Alert message
  const loginForm = document.getElementById('login-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(responseText => {
            // Extract the script content from the response
            const scriptContent = responseText.match(/<script>([\s\S]*?)<\/script>/)[1];
            // Create a new script element and set its content
            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;
            // Append the script element to the body
            document.body.appendChild(scriptElement);
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('An unexpected error occurred. Please try again later.');
        });
    });

    resetPasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(resetPasswordForm);
        const data = {
            email: formData.get('email'),
            new_password: formData.get('new_password'),
            confirm_password: formData.get('confirm_password')
        };

        fetch('/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.text())
        .then(responseText => {
            // Extract the script content from the response
            const scriptContent = responseText.match(/<script>([\s\S]*?)<\/script>/)[1];
            // Create a new script element and set its content
            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;
            // Append the script element to the body
            document.body.appendChild(scriptElement);
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('An unexpected error occurred. Please try again later.');
        });
    });

    // Toggle password visibility
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