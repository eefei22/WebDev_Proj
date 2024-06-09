To those have navbar with cart function, add 3 of these into your ejs file
~~~~~~~~to enable cart function change whole <nav> <nav> to 
 <nav>
      <a href="/homepage"><img src="/images/eduPro_logo.jpg" alt="logo" /></a>
      <div class="nav-links" id="navLinks">
        <i class="fas fa-times" onclick="hideMenu()"></i>
        <ul>
          <li><a href="/form">Subscription</a></li>
          <li><a href="/discover_tutor">Discover Tutor</a></li>
          <li><a href="/tuitionFee">Payment</a></li>
          <li><a href="/helpdesk">Helpdesk</a></li>
        </ul>
      </div>
      <div class="navIcon">
        <!-- Cart Icon -->
        <i
          class="bx bx-cart"
          id="cart-icon"
          alt="Cart Icon"
          data-quantity="0"
        ></i>
        />
        <!-- cart -->
        <div class="cart">
          <h2 class="cart-title">Your Cart</h2>
          <!-- Content -->
          <div class="cart-content"></div>
          <div class="total">
            <div class="total-title">Total</div>
            <div class="total-price">$0</div>
          </div>
          <!-- Buy Button -->
          <button type="button" class="btn-buy">Pay Now</button>
          <!-- Close Cart -->
          <i class="bx bx-x" id="close-cart"></i>
        </div>
        <div class="dropdown">
          <a href="#" class="navLink" id="profileIcon"
            ><img
              id="profileIconImg"
              class="profile-icon"
              src="<%= user.profilePic ? '/uploads/' + user.profilePic : '/images/ic_profile.png' %>"
              alt="user profile"
          /></a>
          <div class="dropdown-content" id="profileDropdownContent">
            <a id="profile" href="/profile/<%= user._id %>">My Profile</a>
            <div class="logout">
              <a href="/" onclick="logout()"
                ><img id="logout-ic" src="/images/logout.png" />Log Out</a
              >
            </div>
          </div>
        </div>
      </div>
      <i class="fas fa-bars" onclick="showMenu()"></i>
    </nav>

~~~~~~~to add the style, add this into <head>
    <link rel="stylesheet" href="css/cart.css" />

    <!-- cart icon -->
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />

~~~~~~~~~~~~~~add this at the end of </body> for cart.js
<script src="/js/cart.js" defer></script>
