/* Site settings. Edit this file when the Council's Stripe account is ready.
   checkoutEndpoint: the address of the serverless function in /functions/api/create-checkout-session.js
   (on Cloudflare Pages this is "/api/create-checkout-session"). Leave it empty and the donate page
   shows a simulated checkout in demo mode, or an "opening soon" message after launch. */
window.ANCSH_CONFIG = {
  checkoutEndpoint: "",
  campaigns: []   // after launch, list live campaigns here as {id: "heritage", title: "Heritage archive"}
};
