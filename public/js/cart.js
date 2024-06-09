document.addEventListener("DOMContentLoaded", () => {
  let cartIcon = document.querySelector("#cart-icon");
  let cart = document.querySelector(".cart");
  let closeCart = document.querySelector("#close-cart");
  let profileIconImg = document.querySelector(".profile-icon");

  cartIcon.onclick = () => {
    cart.classList.add("active");
    profileIconImg.classList.add("hidden");
  };

  closeCart.onclick = () => {
    cart.classList.remove("active");
    profileIconImg.classList.remove("hidden");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  function ready() {
    var removeCartButtons = document.getElementsByClassName("cart-remove");
    for (var i = 0; i < removeCartButtons.length; i++) {
      var button = removeCartButtons[i];
      button.addEventListener("click", removeCartItem);
    }

    var addCartButtons = document.querySelectorAll("#add-cart");
    for (var i = 0; i < addCartButtons.length; i++) {
      var button = addCartButtons[i];
      button.addEventListener("click", addToCart);
    }
    loadCartItems();
  }

  function removeCartItem(event) {
    var buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
    saveCartItems();
    updateCartIcon();
  }

  async function addToCart(event) {
    var button = event.target;
    var subject = button.getAttribute("data-subject");
    var tutorName = button.getAttribute("data-tutor-name");
    var rate = button.getAttribute("data-rate");
    var profilePic = button.getAttribute("data-profile-pic");
    var tutorId = button.getAttribute("data-tutor-id");
    var userId = sessionStorage.getItem("userId");

    if (!tutorId) {
      alert("tutorId is not added (addToCart)");
      return;
    }

    if (!userId) {
      alert("User is not logged in");
      return;
    }

    // Check if the user has already booked this tutor
    const response = await fetch("/check-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, tutorId: tutorId }),
    });
    const data = await response.json();

    if (data.exists) {
      alert("You already booked the course");
      return;
    }

    addProductToCart(subject, tutorName, rate, profilePic, tutorId);
    updateTotal();
    saveCartItems();
    updateCartIcon();
  }

  function addProductToCart(subject, tutorName, rate, profilePic, tutorId) {
    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-item");

    var cartItems = document.getElementsByClassName("cart-content")[0];
    var cartItemTutorIds = cartItems.getElementsByClassName("tutor-id");
    if (!cartItemTutorIds) {
      alert("tutorId is not found (addProductToCart)");
      return;
    }

    for (var i = 0; i < cartItemTutorIds.length; i++) {
      if (cartItemTutorIds[i].innerText === tutorId) {
        alert("You have already added this item to cart");
        return;
      }
    }

    var cartBoxContent = `
        <img src="${profilePic}" alt="profile" class="profile-picture" />
        <div class="course-details">
            <span class="course">${subject}</span><br>
            <span class="tutor">${tutorName}</span>
        </div>
        <span class="price">RM${rate}</span>
        <span class="tutor-id" style="display: none;">${tutorId}</span> <!-- Hidden element to store tutorId -->
        <i class="bx bx-trash cart-remove"></i>`;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    cartShopBox
      .getElementsByClassName("cart-remove")[0]
      .addEventListener("click", removeCartItem);

    saveCartItems();
    updateCartIcon();
  }

  function updateTotal() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartItems = cartContent.getElementsByClassName("cart-item");
    var total = 0;

    for (var i = 0; i < cartItems.length; i++) {
      var cartItem = cartItems[i];
      var priceElement = cartItem.getElementsByClassName("price")[0];
      var price = parseFloat(priceElement.innerText.replace("RM", ""));
      total += price;
    }

    total = Math.round(total * 100) / 100;
    document.getElementsByClassName("total-price")[0].innerText = "RM" + total;
    localStorage.setItem("cartTotal", total);
  }

  function saveCartItems() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartItems = cartContent.getElementsByClassName("cart-item");
    var cartArray = [];

    for (var i = 0; i < cartItems.length; i++) {
      var cartItem = cartItems[i];
      var subject = cartItem.getElementsByClassName("course")[0].innerText;
      var tutorName = cartItem.getElementsByClassName("tutor")[0].innerText;
      var price = cartItem
        .getElementsByClassName("price")[0]
        .innerText.replace("RM", "");
      var profilePic = cartItem.getElementsByTagName("img")[0].src;
      var tutorId = cartItem.getElementsByClassName("tutor-id")[0].innerText;

      cartArray.push({
        subject: subject,
        tutor_name: tutorName,
        rate: price,
        profilePic: profilePic,
        tutorId: tutorId, // Include tutorId here
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartArray));
  }

  function loadCartItems() {
    var cartItems = localStorage.getItem("cartItems");
    if (cartItems) {
      cartItems = JSON.parse(cartItems);
      for (var i = 0; i < cartItems.length; i++) {
        var item = cartItems[i];
        addProductToCart(
          item.subject,
          item.tutor_name,
          item.rate,
          item.profilePic,
          item.tutorId // Pass tutorId to addProductToCart
        );
      }
    }

    var cartTotal = localStorage.getItem("cartTotal");
    if (cartTotal) {
      document.getElementsByClassName("total-price")[0].innerText =
        "RM" + cartTotal;
    }

    updateCartIcon();
  }

  function updateCartIcon() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    var cartItems = cartContent.getElementsByClassName("cart-item").length;
    var cartIcon = document.querySelector("#cart-icon");
    cartIcon.setAttribute("data-quantity", cartItems);
  }

  function clearCart() {
    var cartContent = document.getElementsByClassName("cart-content")[0];
    cartContent.innerHTML = "";
    updateTotal();
    localStorage.removeItem("cartItems");
    updateCartIcon();
  }

  const payBtn = document.querySelector(".btn-buy");
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      const userId = sessionStorage.getItem("userId");
      const email = sessionStorage.getItem("email");
      let cartItems = JSON.parse(localStorage.getItem("cartItems"));
      if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      if (!userId || !email) {
        alert("Missing user information. Please make sure you are logged in.");
        return;
      }

      fetch("/cart-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems,
          userId: userId,
          email: email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            window.location.href = data.url;
            clearCart();
          } else {
            console.error("Error creating Stripe session:", data);
            alert("Error creating payment session. Please try again later.");
          }
        })
        .catch((error) => {
          console.error("Error creating Stripe session:", error);
          alert("Error creating payment session. Please try again later.");
        });
    });
  }
});
