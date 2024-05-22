document.addEventListener("DOMContentLoaded", function () {
    // Get the current page URL
    var currentPageURL = window.location.href;
  
    // Get all navigation links
    var navLinks = document.querySelectorAll('.nav-links ul li a');
  
    // Loop through each link
    navLinks.forEach(function (link) {
      // Check if the link's href matches the current page URL
      if (link.href === currentPageURL) {
        // Add the 'active' class to the matching link
        link.classList.add('active');
      }
    });
  });