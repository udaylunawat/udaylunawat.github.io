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

// Resume download functionality
document.addEventListener('DOMContentLoaded', function() {
  const resumeLink = document.getElementById('resume-link');
  if (resumeLink) {
    resumeLink.addEventListener('click', (e) => {
      const link = document.createElement('a');
      link.href = './src/Uday_Lunawat_Resume_Senior_ML_Engineer_V9.pdf';
      link.download = 'Uday_Lunawat_Resume_Senior_ML_Engineer_V9.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});
