// Utility functions - moved from inline HTML for better caching

// Smooth scrolling for anchor links
document.addEventListener("DOMContentLoaded", function() {
  const smoothScrollLinks = document.querySelectorAll("a[href^='#']");
  const scrollMargin = 0;

  smoothScrollLinks.forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.hash);
      if (target) {
        const targetOffset = target.offsetTop;
        window.scrollTo({
          top: targetOffset - scrollMargin,
          behavior: "smooth",
        });
      }
    });
  });
});
