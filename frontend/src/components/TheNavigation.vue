<script setup>

</script>

<template>
  <div class="navigation">
    <nav>
      <router-link to="/" class="nav-btn">Home</router-link>
      <router-link to="/weeks" class="nav-btn">My Weeks</router-link>
    </nav>
  </div>

</template>

<style scoped>
.nav-btn {
  color: lightgrey;
  margin-left: 1rem;
  text-decoration: none;
  font-weight: bold;
}

.nav-btn:hover {
  text-decoration: underline;
}

.router-link-active {
  color: white;
}
</style>