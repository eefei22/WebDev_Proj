function showMenu() {
  navLinks.style.right = "0";
}

function hideMenu() {
  navLinks.style.right = "-200px";
}
document.addEventListener("DOMContentLoaded", function () {
  // Get the current page URL
  var currentPageURL = window.location.href;

  // Get all navigation links
  var navLinks = document.querySelectorAll(".nav-links ul li a");

  // Loop through each link
  navLinks.forEach(function (link) {
    // Check if the link's href matches the current page URL
    if (link.href === currentPageURL) {
      // Add the 'active' class to the matching link
      link.classList.add("active");
    }
  });

  var navLinks = document.getElementById("navLinks");

  // JavaScript for Toggle Menu
  var navLinksContainer = document.getElementById("navLinks");

  document
    .getElementById("showMenuButton")
    .addEventListener("click", function () {
      navLinksContainer.style.right = "0";
    });

  document
    .getElementById("hideMenuButton")
    .addEventListener("click", function () {
      navLinksContainer.style.right = "-200px";
    });
});

// Prevent default action when clicking profile icon
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("profileIcon")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default action of the click event
    });
});
