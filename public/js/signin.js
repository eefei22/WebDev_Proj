document.addEventListener('DOMContentLoaded', function () {
  //Alert message
  const loginForm = document.getElementById('login-form');
  const resetPasswordLink = document.getElementById('request-reset-link-form');

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

  resetPasswordLink.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(resetPasswordLink);
    const data = {
      email: formData.get('email'),
    };

    fetch('/reset-password-link', {
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
});

// Open and close reset password modal
function openResetPasswordModal() {
  document.getElementById('reset-password-modal').style.display = 'block';
}

function closeResetPasswordModal() {
  document.getElementById('reset-password-modal').style.display = 'none';
}

//Handle alert message
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get('success');
  const errorMessage = urlParams.get('error');

  if (successMessage) {
    alert(successMessage);
    clearQueryParameters();
  }

  if (errorMessage) {
    alert(errorMessage);
    clearQueryParameters();
  }
});

function clearQueryParameters() {
  // Get the current URL
  const url = new URL(window.location);

  // Clear the query parameters
  url.search = '';

  // Update the browser's history
  window.history.replaceState({}, document.title, url);
}
