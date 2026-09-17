<template>
  <div class="footer-container">
    <span class="footer-app">&copy; {{ thisYear }} R.O.X. Community</span>
    <div class="footer-wrapper">
      <div class="footer-content">
        <label>Support</label>
        <router-link to="/our-stores" class="router-item">Our Stores</router-link>
        <router-link to="/about-us" class="router-item">About Us</router-link>
        <router-link to="/faq" class="router-item">FAQ</router-link>
        <router-link to="/privacy-policy" class="router-item">Privacy Policy</router-link>
        <router-link to="/terms-of-services" class="router-item">Terms and Conditions</router-link>
        <router-link to="/return-policy" class="router-item">Return Policy</router-link>
      </div>
      <div class="footer-content">
        <label>Account</label>
        <router-link to="/profile" class="router-item">My Account</router-link>
        <router-link to="/my-order" class="router-item">My Orders</router-link>
      </div>
      <div class="footer-media">
        <label>Follow Us</label>
        <a target="_blank" href="https://www.instagram.com/roxphilippines/?hl=en" class="router-item">Instagram</a>
        <a target="_blank" href="https://www.facebook.com/share/19xjq4tn88/" class="router-item">Facebook</a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "BaseFooter",
  computed: {
    thisYear(){
      const date = new Date();
			return date.getFullYear();
    }
  }
}
</script>
<style scoped lang="scss">
.footer-container {
	padding-inline: 24px;
  padding-block: 64px;
	display: flex;
  flex-direction: column-reverse;
	width: 100%;
	align-items: baseline;
	justify-content: space-between;
	gap: 32px;
	margin-top: auto;
  background: $secondary-color-90;
  color: $white;
  .footer-app {
    text-align: left;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    margin-top: 32px;
    white-space: nowrap;
  }
  .footer-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: baseline;
    justify-content: space-between;
    gap: 48px;
    flex-wrap: wrap;
  }
  label {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 17px;
    text-transform: uppercase;
  }
	.footer-content {
		display: flex;
    flex-direction: column;
		gap: 16px;
		align-items: baseline;
    flex: 1;
	}
  .footer-media {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 16px;
    flex: 1;
  }
  .router-item {
    text-decoration: none;
    text-align: left;
    white-space: nowrap;
    color: $secondary-color-30;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    &:hover {
      cursor: pointer;
      color: $primary-color-40;
    }
  }
}
@media (min-width: 672px) {
  .footer-container {
    flex-direction: row !important;
  }
  .footer-app {
    margin-top: 0 !important;
    width: 100%;
  }
  .footer-wrapper {
    flex-direction: row !important;
    gap: 32px !important;
  }
}
</style>