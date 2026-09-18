import camelCase from "lodash/camelCase";
import upperFirst from "lodash/upperFirst";
import moment from "moment-timezone";
import { createApp } from "vue";
import App from "./App.vue";
import LazyLoadDirectives from "./directives/LazyLoadDirectives";
import router from "./router";
import store from "./store";
//import LogRocket from "logrocket";
import eventStatusesHandler from "./lib/eventStatusesHandler";
// import paymayaSdkClient from "paymaya-js-sdk";

const app = createApp(App);

const requireComponent = require.context(
  // The relative path of the components folder
  "./components/base",
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
  /Base[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach((fileName) => {
  // Get component config
  const componentConfig = requireComponent(fileName);

  // Get PascalCase name of component
  const componentName = upperFirst(
    camelCase(
      // Gets the file name regardless of folder depth
      fileName
        .split("/")
        .pop()
        .replace(/\.\w+$/, "")
    )
  );

  app.component(
    componentName,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig
  );
});

// paymayaSdkClient.init("pk-91PcUjYZOPQdo8XFoWlRtB4irXY47RYkVSLCyBZaSpm", true); // true = sandbox
// app.config.globalProperties.$paymayaSdkClient = paymayaSdkClient;

app.directive("lazyload", LazyLoadDirectives);
app.use(store).use(router).mount("#app");
// app.use(store).use(router).use(vueCrypt).mount("#app");
/*
const isUsingLogRocket = process?.env?.VUE_APP_LOG_ROCKET_ID ? true : false;
if (isUsingLogRocket)
	LogRocket.init(process?.env?.VUE_APP_LOG_ROCKET_ID, {
		shouldCaptureIP: false,
		release: store?.state?.appVersion,
	});
*/
const isLoggedIn = store.getters.isLoggedIn;
window.addEventListener("load", () => {
  if(isLoggedIn) {
    eventStatusesHandler.updateStatuses();
  }
});
const events = [
  "scroll",
  "keypress",
  "touchstart",
  "mousemove",
  "click",
  "pointermove",
  "blur",
  "focus",
];
events.forEach((event) => {
  document.addEventListener(
    event,
    () => {
      var now = moment();
      localStorage.setItem("idle-timestamp", now.format("x"));
    },
    true
  );
});
window.setInterval(() => {
  var now = moment();
  var lastLogin = localStorage.getItem("idle-timestamp");
  var lastTime = lastLogin
    ? moment.tz(parseInt(lastLogin), "Asia/Singapore").format("YYYYMMDD")
    : moment().format("YYYYMMDD");
  var thisTime = moment.tz(moment(), "Asia/Singapore").format("YYYYMMDD");

  if (parseInt(thisTime) != parseInt(lastTime) && store.getters.isLoggedIn) {
    store.dispatch("setInited", false);
    store.dispatch("setInitServer", false);
    store.dispatch("clearLoginToken");
    store.dispatch("clearCustomer");
    if (store.getters.FBLogin) {
      store.getters.FBLogin.logout(() => {
        store.dispatch("setFBLogin", null);
      });
    }
    localStorage.setItem(
      "idle-timestamp",
      moment.tz(now, "Asia/Singapore").format("x")
    );
    router.replace({ name: "LoginPage" });
  }
}, 1000);
window.addEventListener("scroll", () => {
  const violator = document.querySelector(".bps-container");
  const activePopup = document.querySelector(".nav-dropdown.active");
  if(!violator) return;
  if (window.scrollY > 60) {
    violator.classList.add("scrolling");
    if(activePopup) activePopup.classList.add("scrolling");
  } else {
    violator.classList.remove("scrolling");
    if(activePopup) activePopup.classList.remove("scrolling");
  }
});
document.body.addEventListener("click", (e) => {
  let el = e.target;
  if (!(el instanceof Element)) return;

  const blockTitle = el.closest(".nav-dropdown-item-block-title-trigger");
  if (blockTitle) {
    const block = blockTitle.closest(".nav-dropdown-item-block");
    const list = block?.querySelector(".nav-dropdown-item-block-list");
    const dropdown = blockTitle.closest(".nav-dropdown");
    if (list) {
      dropdown?.querySelectorAll(".nav-dropdown-item-block-list.active").forEach((it) => {
        if (it !== list) it.classList.remove("active");
      });
      list.classList.toggle("active");
    }
    return;
  }

  if (document.querySelectorAll(".nav-dropdown").length > 0) {
    document.querySelectorAll(".nav-dropdown").forEach((it) => {
      let parent = it.parentElement;
      let trigger = parent.querySelector(".nav-trigger");
      if (trigger !== el && !it.contains(el)) {
        it.classList.remove("active");
        trigger?.classList.remove("active");
        it.querySelectorAll(".nav-dropdown-item-block-list.active").forEach((list) => {
          list.classList.remove("active");
        });
      }
    });
  }
  let elClasslist = [...el.classList];
  if (elClasslist.includes("nav-trigger") && !el.closest(".nav-dropdown")) {
    let parent = el.parentElement;
    let content = parent.querySelector(".nav-dropdown");
    if (!content) return;
    let classList = [...content.classList];
    if (classList.includes("active")) {
      content.classList.remove("active");
      el.classList.remove("active");
    } else {
      content.classList.add("active");
      el.classList.add("active");
    }
  }
});
// const isUsingLogRocket = process?.env?.VUE_APP_LOG_ROCKET_ID ? true : false;
// if (isUsingLogRocket)
// 	LogRocket.init(process?.env?.VUE_APP_LOG_ROCKET_ID, {
// 		shouldCaptureIP: false,
// 		release: store?.state?.appVersion,
// 	});
