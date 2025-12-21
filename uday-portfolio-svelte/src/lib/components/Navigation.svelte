<script>
  let isOpen = false;

  function showMenu() {
    isOpen = true;
  }

  function hideMenu() {
    isOpen = false;
  }
</script>

<!-- Open icon -->
<!-- <button
  type="button"
  class="nav-icon-btn"
  aria-label="Open navigation menu"
  on:click={showMenu}
>
  <img src="/src/img/menu-icon.svg" alt="" />
</button> -->

<!-- Navigation menu -->
<nav
  class="main-nav"
  class:open={isOpen}
  style="opacity: {isOpen ? 1 : 0}; z-index: {isOpen ? 22 : -1};"
>
<!-- <button
  type="button"
  class="nav-icon-btn"
  aria-label="Close navigation menu"
  on:click={hideMenu}
>
  <img src="/src/img/close-icon.svg" alt="" />
</button> -->

  <ul>
    <li><a href="#homeTitle" on:click={hideMenu}>Home</a></li>
    <li><a href="#about" on:click={hideMenu}>About</a></li>
    <li><a href="#credentials" on:click={hideMenu}>Experience</a></li>
    <li><a href="#skills" on:click={hideMenu}>Skills</a></li>
    <li><a href="#projects" on:click={hideMenu}>Projects</a></li>
    <li><a href="#contact" on:click={hideMenu}>Contact / <span>resume</span></a></li>
  </ul>
</nav>