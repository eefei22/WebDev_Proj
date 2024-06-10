// Handle form submissions
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

//Toggle password visibility
 document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('old_pswd');
    const togglePasswordButton = document.getElementById('toggleOldPassword');

    togglePasswordButton.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      // Toggle eye icon based on password visibility
      togglePasswordButton.classList.toggle('fa-eye-slash');
      togglePasswordButton.classList.toggle('fa-eye');
    });
  });

  //Toggle password visibility
  document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('new_pswd');
    const togglePasswordButton = document.getElementById('toggleNewPassword');

    togglePasswordButton.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      // Toggle eye icon based on password visibility
      togglePasswordButton.classList.toggle('fa-eye-slash');
      togglePasswordButton.classList.toggle('fa-eye');
    });
  });

  //Toggle password visibility
  document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('confirm_pswd');
    const togglePasswordButton = document.getElementById('toggleConfirmPassword');

    togglePasswordButton.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      // Toggle eye icon based on password visibility
      togglePasswordButton.classList.toggle('fa-eye-slash');
      togglePasswordButton.classList.toggle('fa-eye');
    });
  });

  // JavaScript for toggling password visibility
  const togglePassword = document.querySelectorAll('.toggle-password');
  togglePassword.forEach(button => {
    button.addEventListener('click', function () {
      const input = this.parentNode.querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      this.classList.toggle('fa-eye-slash');
      this.classList.toggle('fa-eye');
    });
  });

 //Javascript for previewing the profile picture
 function previewProfilePicture(event) {
  var reader = new FileReader();
  reader.onload = function() {
      var output = document.getElementById('profile-pic');
      output.src = reader.result;
  }
  reader.readAsDataURL(event.target.files[0]);
}