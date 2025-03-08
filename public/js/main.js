// Main JavaScript for MovieMind

document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips if Bootstrap is available
  if (typeof bootstrap !== "undefined") {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Handle multi-select for genres
  const genresSelect = document.getElementById("genres");
  if (genresSelect) {
    // Add a helper text that updates with selected genres
    const genreHelper = document.createElement("div");
    genreHelper.className = "mt-2 small text-muted";
    genreHelper.id = "genreSelectionText";
    genreHelper.textContent = "No genres selected";
    genresSelect.parentNode.appendChild(genreHelper);

    genresSelect.addEventListener("change", function () {
      const selectedOptions = Array.from(this.selectedOptions).map(
        (option) => option.text
      );
      const helperText = document.getElementById("genreSelectionText");

      if (selectedOptions.length > 0) {
        helperText.textContent = `Selected: ${selectedOptions.join(", ")}`;
      } else {
        helperText.textContent = "No genres selected";
      }
    });
  }

  // Add active class to current nav item
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");

    // Check if the current path starts with the link path
    // This handles both exact matches and sub-paths
    if (
      currentLocation === linkPath ||
      (linkPath !== "/" && currentLocation.startsWith(linkPath))
    ) {
      link.classList.add("active");
    }
  });

  // Form validation for recommendation form
  const recommendForm = document.querySelector("#recommendForm");
  if (recommendForm) {
    recommendForm.addEventListener("submit", function (event) {
      const favoriteMovies = document.getElementById("favoriteMovies").value;
      const genres = document.getElementById("genres");
      const mood = document.getElementById("mood").value;

      // Check if at least one field is filled
      if (
        !favoriteMovies &&
        (!genres || genres.selectedOptions.length === 0) &&
        !mood
      ) {
        event.preventDefault();
        alert(
          "Please provide at least one preference (favorite movies, genres, or mood)"
        );
        return;
      }

      // Add a loading indicator
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Getting Recommendations...';
    });
  }
});
