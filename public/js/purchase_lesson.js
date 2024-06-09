document.getElementById("checkout_btn").addEventListener("click", async () => {
  const tutorId = document
    .querySelector(".tutorId")
    .getAttribute("data-tutor-id");
  // Retrieve user details from session storage
  const userId = sessionStorage.getItem("userId");
  const email = sessionStorage.getItem("email");

  const items = [
    {
      subject: document
        .getElementById("checkout_btn")
        .getAttribute("data-subject"),
      tutor_name: document
        .getElementById("checkout_btn")
        .getAttribute("data-tutor-name"),
      rate: document.getElementById("checkout_btn").getAttribute("data-rate"),
      profilePic: document
        .getElementById("checkout_btn")
        .getAttribute("data-profile-pic"),
    },
  ];

  try {
    // Check if the user has already booked the course
    const res = await fetch("/check-course-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tutorId, userId }),
    });

    const data = await res.json();
    if (data.alreadyBooked) {
      alert("You already booked the course");
      return;
    }

    // Proceed to create checkout session if the user hasn't already booked
    const createSessionRes = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items, userId, email, tutorId }),
    });

    const sessionData = await createSessionRes.json();
    if (sessionData.url) {
      window.location.href = sessionData.url;
    }
  } catch (error) {
    console.error("Error during checkout:", error);
  }
});
