document.addEventListener("DOMContentLoaded", function () {
  const selectAllCheckbox = document.getElementById("select-all-checkbox");
  const courseCheckboxes = document.querySelectorAll(".course-checkbox");
  const totalElement = document.querySelector(".unpaid-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const removeBtn = document.getElementById("remove-btn");

  function updateTotal() {
    let total = 0;
    courseCheckboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        const price = parseFloat(checkbox.getAttribute("price"));
        total += price;
      }
    });
    totalElement.textContent = "Total: RM" + total.toFixed(2);

    // Disable the checkout button if no courses are selected
    checkoutBtn.disabled = !Array.from(courseCheckboxes).some(
      (checkbox) => checkbox.checked
    );
  }

  selectAllCheckbox.addEventListener("change", function () {
    courseCheckboxes.forEach(function (checkbox) {
      checkbox.checked = selectAllCheckbox.checked;
    });
    updateTotal();
  });

  courseCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      if (!checkbox.checked) {
        selectAllCheckbox.checked = false;
      } else if (
        Array.from(courseCheckboxes).every((checkbox) => checkbox.checked)
      ) {
        selectAllCheckbox.checked = true;
      }
      updateTotal();
    });
  });

  checkoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const selectedItems = Array.from(courseCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selectedItems.length === 0) {
      alert("Please select at least one course before proceeding to checkout.");
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const email = sessionStorage.getItem("email");

    const descriptions = Array.from(
      document.querySelectorAll(".description-input")
    )
      .filter((input, index) => courseCheckboxes[index].checked)
      .map((input) => input.value);

    try {
      const paymentRes = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedCourses: selectedItems,
          userId,
          email,
          descriptions,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await paymentRes.json();
      window.location = url;
    } catch (error) {
      console.error("Error:", error);
    }
  });

  removeBtn.addEventListener("click", async (event) => {
    // Add this block
    event.preventDefault();

    const selectedItems = Array.from(courseCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selectedItems.length === 0) {
      alert("Please select at least one course before removing.");
      return;
    }

    try {
      const removeRes = await fetch("/removePayments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedCourses: selectedItems }),
      });

      if (!removeRes.ok) {
        throw new Error("Failed to remove selected courses");
      }

      // Reload the page after successful removal
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Initial total update
  updateTotal();
});
