import { eventService, homeService, storeService, productService } from "@/bloc/services";
import { EUNOIA_CONFIG } from "@/connector/apiConfig";
import {
  getCart,
  getFavorites,
  getInventory,
  getMenu,
  postOutletOrder,
} from "@/connector/v4/productConnector";
import { getPromotions } from "@/connector/v4/storeConnector.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import router from "../../router";
import initData from "@/init";
export default {
  methods: {
    defaultProductImages(prd) {
      let images = [];
      let url = this.$store.getters.cloudinaryURL;
      if (!isEmpty(prd.imageId))
        images.push({
          index: 0,
          thumbnail: `${url}${prd.imageId}?width=300`,
          image: `${url}${prd.imageId}`,
        });
      if (!isEmpty(prd.image2Id))
        images.push({
          index: 1,
          thumbnail: `${url}${prd.image2Id}?width=300`,
          image: `${url}${prd.image2Id}`,
        });
      if (!isEmpty(prd.image3Id))
        images.push({
          index: 2,
          thumbnail: `${url}${prd.image3Id}?width=300`,
          image: `${url}${prd.image3Id}`,
        });
      if (!isEmpty(prd.images)) {
        prd.images.sort((a, b) => a.sortIndex - b.sortIndex);
        images = prd.images.map((it, ix) => {
          let imageId = it.id;
          return {
            index: ix,
            thumbnail: `${url}${imageId}?width=300`,
            image: `${url}${imageId}`,
          };
        });
      }
      if (!isEmpty(prd.variants)) {
        let variants = prd.variants;
        let promoVariants = variants.filter((v) => v.promoPrice > 0);
        if (!isEmpty(promoVariants)) {
          variants = promoVariants;
        }
        variants?.sort((a, b) => a.price - b.price);
        let variantsWithImages = variants.filter((v) => !isEmpty(v.images));
        if (!isEmpty(variantsWithImages)) {
          let variantImages = variantsWithImages[0].images.map((img, ix) => {
            return {
              index: images.length + ix,
              thumbnail: `${url}${img.id}?width=300`,
              image: `${url}${img.id}`,
              sortIndex: img.sortIndex,
            };
          });
          return [...variantImages, ...images];
        }
      }
      if (isEmpty(images)) {
        images = [
          {
            index: 0,
            thumbnail: require("@/assets/images/rox-logo-2025.jpeg"),
            image: require("@/assets/images/rox-logo-2025.jpeg"),
          },
        ];
      }
      return images;
    },
    slugName(name) {
      if (!name) return "";
      let names = name
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        ?.map((it) => {
          if (it.toUpperCase() == it) return it;
          return it.toLowerCase();
        });
      return names.join("-");
    },
    isEmpty(expression) {
      return isEmpty(expression);
    },
    goTo(pageName) {
      return this.$router.push({
        name: pageName,
      });
    },
    goToWithParams(pageName, params) {
      return this.$router.push({
        name: pageName,
        params,
      });
    },
    goBack() {
      let currentRoute = this.$router.currentRoute.value;
      // if (!currentRoute.redirectedFrom) {
      //   let page = "HomePage";
      //   if (!this.isLoggedIn()) page = "WelcomePage";
      //   return this.$router.replace({ name: page });
      // }
      if (window.history.state.back === null) {
        return this.goTo("WelcomePage");
      }
      if (this.$route.query.reinit) {
        this.$store.dispatch("setInited", false);
      }
      if (this.$route.query.redirect) {
        if (!this.isLoggedIn()) {
          return this.$router.replace({ name: "WelcomePage" });
        }
        if (currentRoute) {
          let redirectFrom = currentRoute.redirectedFrom;
          if (redirectFrom) {
            let requiredLogin = redirectFrom.meta.requireLogin;
            if (requiredLogin && !this.isLoggedIn())
              return this.goTo("WelcomePage");
          }
        }
        return this.$router.replace(this.$route.query.redirect);
      }

      return this.$router.back();
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    logout() {
      this.$store.dispatch("clearLoginToken");
      this.$store.dispatch("clearCustomer");
      if (this.$store.getters.getFBLogin) {
        this.$store.getters.getFBLogin.logout((res) => {
          console.log(res);
          this.$store.dispatch("setFBLogin", null);
        });
      }
      this.$router.replace({ name: "WelcomePage" });
    },
    isValidEmail(email) {
      let pattern = /\S+@\S+\.\S+/;
      return pattern.test(email);
    },
    isValidPhone(phone) {
      if (!phone) return false;
      if (Number.isNaN(phone)) return false;
      if (phone.toString().length >= 10 && phone.toString().length <= 12)
        return true;
      return (
        phone.toString().length === 8 &&
        (phone.toString().startsWith("8") || phone.toString().startsWith("9"))
      );
    },
    showNotification(type, icon, message, autoClose = true) {
      this.$store.dispatch("notification/updateNotification", {
        show: true,
        type: type,
        icon: icon,
        message: message,
        autoClose: autoClose,
      });
    },
    isPartOfLinkedNudges(nudge, allNudges) {
      const isStart = nudge.tags
        ?.map((it) => it.toLowerCase())
        ?.includes("nudge_1");

      const isPart = allNudges.find((it) => {
        return (
          it.tags?.map((it) => it.toLowerCase())?.includes("nudge_1") &&
          it.links?.includes(nudge.id)
        );
      });

      return isStart || isPart;
    },
    async refreshCustomerData() {
      let cust = this.$store.getters.getCustomer;
      if (isEmpty(cust) && !this.isLoggedIn()) return;
      let customer = await homeService.getCustomerDetails();
      this.$store.dispatch("setCustomer", customer);
    },
    isHQ() {
      return this.$store.getters.isHQ;
    },
    isGuestCustomer() {
      let regCust = this.$store.getters.getCustomer;
      return isEmpty(regCust) && !this.isLoggedIn();
    },
    async refreshMainData() {
      let skip =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : false;
      let callback =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      /*
      let layer = await storeService.getLayer();
      if(!layer.success) return;

      let hq = false;
      if(layer.type == 'HEADQUARTER') {
        hq = true;
        this.$store.dispatch("setHQ", true);
      }
      */
      this.$store.getters.getCarts;
      let hq = true;
      this.$store.dispatch("setHQ", true);
      await this.refreshCustomerData();
      this.startCurrentLocation();
      let response = await storeService.retrieveStores();
      if (response.success) {
        if (!isEmpty(response.app)) {
          this.$store.dispatch(
            "setMixnMatch",
            response.app.multipleCheckout == true
          );
          if (response.app.properties?.homeBanner) {
            this.$store.dispatch(
              "setHomeBanner",
              response.app.properties.homeBanner
            );
          }
          if (response.app.properties?.eventBanner) {
            this.$store.dispatch(
              "setEventBanner",
              response.app.properties.eventBanner
            );
          }
        }
        let stores = [];
        if (hq) {
          this.$store.dispatch("setHeadquarter", response);
          this.$store.dispatch("setOutlets", response.outlets || []);
          if (!isEmpty(response.outlets)) {
            response.outlets.forEach((o) => {
              if (isEmpty(o.stores)) return;
              o.stores.forEach((s) => {
                stores.push(s);
              });
            });
          }
        } else {
          this.$store.dispatch("setStoreBrand", response.brand);
          if (!isEmpty(response.stores)) {
            stores = response.stores.sort(function (a, b) {
              return a.sortIndex - b.sortIndex;
            });
          }
        }
        this.initNearestStore(stores);
      }
      this.$store.dispatch("setCuratedBrands", []);
      await this.retrieveFavorites(skip);
      if (this.$store.getters.isServerInited) {
        this.$store.dispatch("setInited", true);
      }
      this.$store.dispatch("setInitServer", true);
      callback();
    },
    isJSON(data) {
      try {
        JSON.parse(data);
      } catch (e) {
        return false;
      }
      return true;
    },
    async retrieveInventory(skip, outletCode, productId, brandCode) {
      if (skip) return;
      var res = await getInventory(outletCode, productId, brandCode);
      if (res.inventories) {
        this.$store.dispatch("setInventory", res.inventories);
      }
    },
    async retrieveFavorites(skip) {
      if (!this.isLoggedIn()) return;
      if (skip == true) return;
      var res = await getFavorites();
      if (res.success) {
        this.$store.dispatch("setFavorites", res.products);
      }
    },
    async retrieveMenu() {
      let products = [];
      let categories = [];
      let tags = [];
      let finalBrands = [];
      let outlets = this.$store.getters.getOutlets;
      let storeState = this.$store.getters.getStateStorePage || {};
      for (let i = 0; i < outlets.length; i++) {
        let outletCode = outlets[i].apiCode;
        let res = initData?.outletsMenu[outletCode] || {};
        if (res.success) {
          if (!isEmpty(res.stores)) {
            let curatedBrands = [];
            let hq = this.$store.getters.getHeadquarter;
            if (
              !isEmpty(hq) &&
              !isEmpty(hq.app) &&
              !isEmpty(hq.app.properties)
            ) {
              curatedBrands = hq.app.properties.curatedBrands
                .split(",")
                .map((br) => {
                  return br.trim();
                });
            }
            let brands = res.stores
              .map((s) => {
                return s.brand;
              })
              .filter((br) => {
                return curatedBrands.includes(br.apiCode);
              });
            if (!isEmpty(brands)) {
              brands.forEach((b) => {
                if (!finalBrands.map((f) => f.apiCode).includes(b.apiCode)) {
                  finalBrands.push(b);
                }
              });
            }
            res.stores.forEach((s) => {
              let menu = s.menu;
              let newProducts = menu.products
                .filter((prod) => {
                  return !products
                    .map((p) => {
                      return p.id;
                    })
                    .includes(prod.id);
                })
                .map((prd) => {
                  prd.brands = prd.brands || [];
                  if (prd.price == null) prd.price = prd.originalPrice || 0;
                  if (
                    !prd.brands
                      .map((b) => {
                        return b.id;
                      })
                      .includes(s.brand.id)
                  ) {
                    prd.brands.push(s.brand);
                  }
                  return prd;
                });
              products = [...products, ...newProducts];
              categories = [
                ...categories,
                ...menu.categories.filter((cat) => {
                  return (
                    categories
                      .map((m) => {
                        return m.id;
                      })
                      .indexOf(cat.id) == -1
                  );
                }),
              ];
              tags = [
                ...tags,
                ...menu.tags
                  .filter((it) => {
                    return (
                      it.name != "" &&
                      tags
                        .map((t) => {
                          return t.name.toLowerCase();
                        })
                        .indexOf(it.name.toLowerCase()) == -1
                    );
                  })
                  .map((t) => {
                    t.brands = t.brands || [];
                    if (t.brands.indexOf(s.brand.apiCode) == -1)
                      t.brands.push(s.brand.apiCode);
                    return t;
                  }),
              ];
            });
          }
        }
      }
      if(storeState.lastUpdated) {
        categories = storeState.categories;
        tags = storeState.tags;
        let curatedBrands = [];
        let hq = this.$store.getters.getHeadquarter;
        if (
          !isEmpty(hq) &&
          !isEmpty(hq.app) &&
          !isEmpty(hq.app.properties)
        ) {
          curatedBrands = hq.app.properties.curatedBrands
            .split(",")
            .map((br) => {
              return br.trim();
            });
          finalBrands = storeState.brandsProductsList.filter((br) => curatedBrands.includes(br.apiCode) );
        }
      }

      this.$store.dispatch("setProducts", products);
      this.$store.dispatch("setCategories", categories);
      this.$store.dispatch("setTags", tags);
      this.$store.dispatch("setCuratedBrands", finalBrands);
    },
    getOutletCode() {
      let originalCarts = this.$store.getters.getCarts;
      if (!isEmpty(originalCarts)) {
        let apiCodes = Object.keys(originalCarts);
        return apiCodes[0];
      }
      let currentStore = this.getCurrentStore();
      let code = currentStore ? currentStore.id : "";
      let isHQ = this.$store.getters.isHQ;
      if (isHQ) {
        let hq = this.$store.getters.getHeadquarter;
        if (isEmpty(currentStore)) {
          if (!isEmpty(this.$store.getters.getCurrentOutlet)) {
            return this.$store.getters.getCurrentOutlet.apiCode;
          }
          if (!isEmpty(hq.outlets)) return hq.outlets[0].apiCode;
          return "";
        }
        let outlet = hq.outlets.find((o) => {
          let st = o.stores.filter((s) => {
            return s.id == currentStore.id;
          });
          return st.length > 0;
        });
        if (outlet) code = outlet.apiCode;
      }
      return code;
    },
    initNearestStore() {
      let stores =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.$store.dispatch("setStoreList", stores);
      if (isEmpty(stores)) return;
      let userCoords = this.getCurrentLocation();
      let momente = moment();
      let day = momente.format("dddd").toUpperCase();
      let milliseconds = momente.format("x");
      stores.forEach((s) => {
        s.availabelToday = false;
        let hours = s.openingHours || [];
        let activeHours = !isEmpty(hours)
          ? hours.filter((h) => {
              return h.dayOfWeek.toUpperCase() == day;
            })
          : [];
        if (!isEmpty(activeHours)) {
          let h = activeHours[0];
          let date = moment().format("YYYY-MM-DD");
          let fromTime = moment(date + " " + h.startTime.substring(0, 5));
          let endTime = moment(date + " " + h.endTime.substring(0, 5));
          s.availabelToday =
            milliseconds >= fromTime.format("x") &&
            milliseconds < endTime.format("x");
        }
        s.distance = null;
        if (!isEmpty(userCoords) && !isEmpty(s.coord)) {
          let radlat1 = (Math.PI * userCoords.lat) / 180;
          let radlat2 = (Math.PI * s.coord.lat) / 180;
          let theta = userCoords.lng - s.coord.lng;
          let radtheta = (Math.PI * theta) / 180;
          let dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          if (dist > 1) dist = 1;
          dist = Math.acos(dist);
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515;
          dist = parseFloat(dist * 1.609344).toFixed(2); //in Kilometers
          s.distance = dist;
        }
      });
      stores.sort((a, b) => {
        return a.distance - b.distance;
      });
      let currentStore = stores[0];
      let activeStores = stores.filter((s) => {
        return s.availabelToday;
      });
      if (!isEmpty(activeStores)) {
        currentStore = activeStores[0];
      }
      if (this.$store.getters.hasInited) {
        let existStore = this.$store.getters.getCurrentStore;
        if (!isEmpty(existStore)) {
          if (
            !isEmpty(
              stores.find((s) => {
                return s.id == existStore.id;
              })
            )
          ) {
            // dont change the existing selected store:
            return;
          }
        }
      }
      this.$store.dispatch("setCurrentStore", currentStore);
    },
    getStoreList() {
      return this.$store.getters.getStoreList;
    },
    getOutlets() {
      return this.$store.getters.getOutlets;
    },
    getCurrentStore() {
      return this.$store.getters.getCurrentStore;
    },
    getCurrentOutlet() {
      return this.$store.getters.getCurrentOutlet;
    },
    getPaymentAccounts() {
      return this.$store.getters.getPaymentAccounts;
    },
    getCurrentLocation() {
      return this.$store.getters.getCurrentLocation;
    },
    startCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          this.$store.dispatch("setCurrentLocation", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        });
      }
    },
    currency(value) {
      let currencySymbol = this.$store.getters.getCurrencySymbol;
      let isMinus = parseFloat(value) < 0;
      if (value != null) {
        value = isMinus ? Math.abs(value).toFixed(2) : value.toFixed(2);
        let curr = "";
        let positiveValue = value.toString().split(".")[0];
        let decimalValue =
          value.toString().split(".").length > 1
            ? value.toString().split(".")[1]
            : "00";
        let currRev = positiveValue.toString().split("").reverse().join("");
        for (let i = 0; i < currRev.length; i++) {
          if (i % 3 == 0) {
            curr += currRev.substr(i, 3) + ",";
          }
        }

        let totalString = curr
          .split("", curr.length - 1)
          .reverse()
          .join("");
        if (isMinus) currencySymbol = `-${currencySymbol}`;
        return `${currencySymbol}${totalString}.${decimalValue > 0 ? decimalValue : "00"}`;
      }
    },
    getFavoriteProducts() {
      return this.$store.getters.getFavorites;
    },
    isFavoriteProduct(productId, variantId) {
      let favorites = this.$store.getters.getFavorites || [];
      if (!favorites) return false;
      let data = favorites.filter((it) => {
        if (variantId)
          return it.product == productId && it.variant == variantId;
        return it.product == productId;
      });
      return data.length > 0;
    },
    async checkoutEvent(request) {
      let test =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : true;
      let callbackSuccess =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let skipToken =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : false;

      if (isEmpty(request))
        return callbackSuccess({
          success: false,
          message: "Request is empty!",
        });

      let booking = request.booking;
      let payment = request.payment || null;
      let cartId = this.$store.getters.getCartId;
      let parentPromoCodes = this.$store.getters.getPromoCodes || {};
      let promoCodes = [];
      for(let k in parentPromoCodes) {
        promoCodes = Array.from(new Set([...promoCodes, ...parentPromoCodes[k]]))
      };
      if (isEmpty(booking))
        return callbackSuccess({
          success: false,
          message: "Booking data is empty!",
        });
      let customer = booking.customer;
      let params = {
        type: booking.type,
        name: booking.name,
        payments: [],
        items: [],
        total: booking.total,
        promoCodes: promoCodes,
      };
      let cashVouchers = [];
      let vouchers = [];
      let vcash = this.$store.getters.getAppliedCashVouchers || {};
      for(let k in vcash){
        if(k != "event") continue;
        cashVouchers = [
          ...cashVouchers, 
          ...vcash[k]?.map((it) => ({ number: it.promotion.number, pin: it.promotion.pin }))
        ];
      }
      let vcs = this.$store.getters.getAppliedVouchers || {};
      for(let k in vcs){
        if(k != "event") continue;
        vouchers = [...vouchers, ...vcs[k].map((it) => it.id)];
      }
      params.vouchers = vouchers;
      params.cashVouchers = cashVouchers;
      if (skipToken) {
        params.customer = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        };
      }
      if (payment) params.payments.push(payment);
      let item = {
        sessionTimeId: booking.sessionTimeId,
        quantity: booking.quantity,
        participants: booking.participants,
      };

      params.test = test == true;
      params.draft = test == true;
      params.cartId = cartId;
      if (params.total <= 0) {
        params.draft = false;
        params.cartId = null;
      }
      params.items.push(item);

      let res = await eventService.bookEvent(params);
      if (res.cartId) {
        this.$store.dispatch("setCartId", res.cartId);
      }
      if (!res.success && res.code && res.code == "-666") {
        customer.eunoiaAuthToken = "";
        this.$store.dispatch("setCustomer", customer);
        this.$store.dispatch("setEunoiaToken", "");
        return this.checkoutEvent(request, test, callbackSuccess, true);
      }
      callbackSuccess(res);
    },
    getCartImage(cart) {
      let prd = cart.product;
      let variant = prd
        ? prd.variants?.find((v) => v.id == cart.variant.id)
        : null;
      let images = prd?.images;
      let img = prd.imageId;
      if (!img) img = prd.image2Id;
      if (!img) img = prd.image3Id;
      if (variant && !isEmpty(variant.images)) {
        images = variant.images;
        images.sort((a, b) => a.sortIndex - b.sortIndex);
      }
      if (!isEmpty(images)) {
        images.sort((a, b) => a.sortIndex - b.sortIndex);
        img = images[0].id;
      }
      if (!img) return require("@/assets/images/rox-logo-2025.jpeg");
      return this.$store.getters.cloudinaryURL + img + "?width=250";
    },
    getImage(image, prop) {
      if (!image) return require("@/assets/images/rox-logo-2025.jpeg");
      if (!prop) return `${this.$store.getters.cloudinaryURL}${image}`;
      return `${this.$store.getters.cloudinaryURL}${image}?${prop}`;
    },
    resizeImageHandler() {
      let length = document.getElementsByClassName("img-ratio").length;
      for (var i = 0; i < length; i++) {
        let classList =
          document
            .getElementsByClassName("img-ratio")
            [i].classList.value?.split(" ") || [];
        let customRatio = classList.indexOf("custom-ratio") > -1;
        let w = document.getElementsByClassName("img-ratio")[i].clientWidth;
        let h = (9 / 16) * w;
        if (customRatio) {
          let ratio34 = classList.indexOf("ratio-34") > -1;
          let ratio43 = classList.indexOf("ratio-43") > -1;
          if (ratio34) h = (3 / 4) * w;
          if (ratio43) h = (4 / 3) * w;
        }
        document.getElementsByClassName("img-ratio")[i].style[
          "height"
        ] = `${h}px`;
      }
    },
    calculateTotalOrder(totalAmount, outletCode) {
      if (totalAmount == 0) return totalAmount;
      let discountPerBrand = !isEmpty(this.$store.getters.getDiscountPerBrand) ? (this.$store.getters.getDiscountPerBrand[outletCode] || []) : [];
      if (!isEmpty(discountPerBrand)) {
        discountPerBrand.forEach((d) => {
          totalAmount -= parseFloat(d.discount.amount) || 0;
        });
      }
      let discounts = !isEmpty(this.$store.getters.getDiscounts) ? (this.$store.getters.getDiscounts[outletCode] || []) : [];
      if (!isEmpty(discounts)) {
        discounts.forEach((d) => {
          totalAmount -= parseFloat(d.amount) || 0;
        });
      }
      let outletExtraCharges = !isEmpty(this.$store.getters.getOutletExtraCharges) ? (this.$store.getters.getOutletExtraCharges[outletCode] || []) : [];
      if (!isEmpty(outletExtraCharges)) {
        outletExtraCharges.forEach((it) => {
          if (!it.extraCharges.inclusive)
            totalAmount += parseFloat(it.extraCharges.amount) || 0;
        });
      }
      let extraCharges = !isEmpty(this.$store.getters.getExtraCharges) ? (this.$store.getters.getExtraCharges[outletCode] || []) : [];
      if (!isEmpty(extraCharges)) {
        extraCharges.forEach((it) => {
          if (!it.inclusive) totalAmount += parseFloat(it.amount) || 0;
        });
      }
      return totalAmount;
    },
    rebuildCarts(carts){
      let mappedCarts = {};
      for(let i = 0; i<carts.length;i++){
          let ou = carts[i].outletStore;
          let code = ou.apiCode;
          if(!mappedCarts[code]) mappedCarts[code] = [];
          mappedCarts[code].push(carts[i]);
      }
      return mappedCarts;
    },
    cartsBrandType(carts, _type){
      if(!carts?.length) return [];
      return carts.filter((c) => this.collectBrandsList()?.find((b) => b.apiCode == c.product?.brand)?.type == _type);
    },
    async testOrder() {
      let self = this;
      let rollbackAtError =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : true;
      let callbackSuccess =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : function () {};
      let callbackError =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let draft =
        arguments.length > 3 && arguments[3] !== undefined
          ? arguments[3]
          : false;
      let test =
        arguments.length > 4 && arguments[4] !== undefined
          ? arguments[4]
          : true;
      let overrideCarts =
        arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
      let generatePayloadOnly =
        arguments.length > 5 && arguments[5] !== undefined ? true : false;
      let outletCode =
        arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : "";
      let overrideCartId =
        arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
      
      let parentCartId = this.$store.getters.getCartId;
      let cartId = !isEmpty(parentCartId) ? (parentCartId[outletCode] || null) : null;
      let parentOrderRequest = this.$store.getters.getOrderRequest || {};
      let orderRequest = parentOrderRequest[outletCode] || {};
      let dineType = this.$store.getters.getDineType;
      orderRequest.address = null;
      if (dineType == "RETAIL_DELIVERY") {
        let address = this.$store.getters.getDeliveryAddress;
        if (!isEmpty(address)) {
          delete address.clicked;
          orderRequest.address = address;
        }
      }
      orderRequest.fulfillmentTime = null;
      orderRequest.type = dineType;
      orderRequest.promoCodes = [];

      let promoCodes = (this.$store.getters.getPromoCodes || {})[outletCode];
      let removedPromocodes = (this.$store.getters.getAutoPromoCodes || {})[outletCode];
      if (!isEmpty(removedPromocodes) && !isEmpty(promoCodes)) {
        removedPromocodes = removedPromocodes.filter((it) => {
          return !promoCodes.includes(it);
        });
      }
      let cashVouchers = [];
      let vouchers = [];
      let parentAppliedCashVouchers = this.$store.getters.getAppliedCashVouchers || {};
      let parentAppliedVouchers = this.$store.getters.getAppliedVouchers || {};
      if (parentAppliedCashVouchers[outletCode]) {
        cashVouchers = parentAppliedCashVouchers[outletCode]?.map((it) => {
          return {
            number: it.promotion.number,
            pin: it.promotion.pin,
          };
        });
      }
      if (parentAppliedVouchers[outletCode]) {
        vouchers = parentAppliedVouchers[outletCode]?.map((it) => {
          return it.id;
        });
      }
      orderRequest.promoCodes = promoCodes || [];
      orderRequest.cashVouchers = cashVouchers || [];
      orderRequest.vouchers = vouchers || [];
      orderRequest.removedPromos = removedPromocodes || [];

      orderRequest.draft = draft;
      orderRequest.test = test;
      if (cartId && draft == true) orderRequest.cartId = cartId;
      if (overrideCartId) orderRequest.cartId = cartId; // overrideCartId is used for CASH payment with cartID mechanism:
      if (!this.isGuestCustomer()) {
        let cust = this.$store.getters.getCustomer;
        orderRequest.customer = {
          firstName: cust.firstName,
          lastName: cust.lastName,
          email: cust.email,
          phone: cust.phone,
        };
      }
      /*
      orderRequest.vouchers = _.uniq(self.appliedVouchers.map(function (voucher) {
        return voucher.id;
      }));
      orderRequest.rewardPoints = self.rewardPoints;
      */

      let parentCarts = this.$store.getters.getCarts || {};
      let mainCarts = parentCarts[outletCode];
      let carts = mainCarts;
      if (generatePayloadOnly) {
        carts = overrideCarts;
      }
      if (!isEmpty(carts)) {
        // exclude free items from orderRequest:
        carts = carts.filter((cart) => {
          return isEmpty(cart.freeProduct);
        });
      }
      orderRequest.total = 0;
      orderRequest.subTotal = 0;
      let selectedCarts = carts?.filter((cx) => cx.checked == true);
      let fnbCarts = this.cartsBrandType(selectedCarts, "FOOD");
      if (isEmpty(selectedCarts)) {
        orderRequest.type = "RETAIL";
      }
      console.log('fnbCarts', fnbCarts);
      if(!isEmpty(fnbCarts)) {
        dineType = "TAKE_AWAY";
        orderRequest.type = dineType;
      }
      orderRequest.orders = [];
      if (selectedCarts?.length > 0) {
        selectedCarts.forEach(function (cart) {
          let tempItems = [];
          if (orderRequest.orders.length == 0) {
            orderRequest.orders.push({
              type: dineType,
              store: cart.storeId,
              fulfillmentTime: orderRequest.fulfillmentTime,
              items: [
                {
                  specialRequest: cart.specialInstructions,
                  quantity: cart.quantity,
                  product: cart.product.id,
                  modifiers: cart.modifiers,
                  variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                  storeName: cart.storeName,
                  freeProduct: cart.freeProduct,
                },
              ],
            });
          } else {
            let newOrder = 0;
            tempItems = {
              specialRequest: cart.specialInstructions,
              quantity: cart.quantity,
              product: cart.product.id,
              modifiers: cart.modifiers,
              variant: !isEmpty(cart.variant) ? cart.variant.id : "",
              storeName: cart.storeName,
              freeProduct: cart.freeProduct,
            };
            orderRequest.orders.some(function (t) {
              if (t.store == cart.storeId) {
                t.items.push(tempItems);
                newOrder = 0;
                return true;
              } else {
                newOrder++;
              }
            });
            if (newOrder >= 1) {
              orderRequest.orders.push({
                type: dineType,
                store: cart.storeId,
                fulfillmentTime: orderRequest.fulfillmentTime,
                items: [
                  {
                    specialRequest: cart.specialInstructions,
                    quantity: cart.quantity,
                    product: cart.product.id,
                    modifiers: cart.modifiers,
                    variant: !isEmpty(cart.variant) ? cart.variant.id : "",
                    storeName: cart.storeName,
                    freeProduct: cart.freeProduct,
                  },
                ],
              });
            }
          }
          orderRequest.total += cart.accPrice;
          orderRequest.subTotal += cart.accPrice;
        });
      }
      if(isEmpty(orderRequest.orders) && draft == false && test == false){
        return {
          success: false,
          message: "Empty cart cannot be processed!"
        }
      }
      if (
        this.calculateTotalOrder(orderRequest.total, outletCode) == 0 &&
        test == false
      ) {
        draft = false;
        cartId = null;
        orderRequest.cartId = null;
        self.$store.dispatch("setCartId", {
          ...parentCartId,
          [outletCode]: null
        });
      }
      /*
      if(isTrue(skipRequestAPI)){
        return self.cartItemAdded(callbackSuccess());
      }
      */
      let response = await postOutletOrder(orderRequest, outletCode);
      /*
      if (generatePayloadOnly) {
        if (response?.success) return callbackSuccess(response);
        return callbackError(response);
      }
      */
      if (!response.success)
        return this.failedOrder(response, rollbackAtError, callbackError, outletCode);
      this.$store.dispatch("setOrderRequest", {
        ...parentOrderRequest,
        [outletCode]: orderRequest
      });
      return this.successOrder(response, callbackSuccess, outletCode);
    },
    parentCartsCount(){
      let bankCarts = this.$store.getters.getCarts || {};
      let carts = [];
      for(let k in bankCarts){
        carts = [...carts, ...bankCarts[k]];
      }
      if(isEmpty(carts)) return 0;
      let cartIds = carts.map((it) => it.id);
      return Math.max(...cartIds) + 1;
    },
    async successOrder(response, callbackSuccess, outletCode) {
      let self = this;
      let parentOrderRequest = this.$store.getters.getOrderRequest || {};
      let orderRequest = parentOrderRequest[outletCode] || {};
      let discountPerBrand = [];
      let outletExtraCharges = [];
      let discs = response.order.discounts || [];
      let bankCarts = self.$store.getters.getCarts || {};
      let cartsCount = self.parentCartsCount();
      let carts = bankCarts[outletCode] || [];
      let fromOrders = [];
      let currentDiscs = self.$store.getters.getDiscounts || {};
      let currentExtracharges = self.$store.getters.getExtraCharges || {};
      let currentBusy = self.$store.getters.getBusy || {};
      let currentEtatime = self.$store.getters.getEtaTime || {};
      let thisOutlet = this.$store.getters.getOutlets?.find((o) => o.apiCode == outletCode);
      let brandsList = this.$store.getters.getHeadquarter?.headquarter?.brand || [];
      self.$store.dispatch("setDiscounts", { 
        ...currentDiscs, 
        [outletCode]: discs 
      });
      self.$store.dispatch("setExtraCharges", {
        ...currentExtracharges,
        [outletCode]: response.order.extraCharges || []
      });
      self.$store.dispatch("setEtaTime", {
        ...currentEtatime,
        [outletCode]: response.order.etaTime || null
      });
      self.$store.dispatch("setBusy", {
        ...currentBusy,
        [outletCode]: response.order.busy
      });
      if (response.pointsBalance) {
        let currentPointUsed = self.$store.getters.getPointUsed || {};
        let currentPointBalance = self.$store.getters.getTotalPoint || {};
        self.$store.dispatch("setPointUsed", {
          ...currentPointUsed,
          [outletCode]: response.pointsUsed
        });
        self.$store.dispatch("setTotalPoint", {
          ...currentPointBalance,
          [outletCode]: response.pointsBalance
        }); //totalPointsReward - self.pointsUsed;
      }
      let etaTimeCurrent = self.$store.getters.getEtaTime || {};
      self.$store.dispatch("setEtaTime", {
        ...etaTimeCurrent,
        [outletCode]: !isEmpty(response.order.orders) ? response.order.orders[0].etaTime : null
      });
      response.order.orders.forEach(function (o) {
        let oneStore = thisOutlet?.stores.find((s) => s.id == o.store);
        let oneBrand = brandsList.find((b) => b.apiCode == oneStore?.brandCode);
        fromOrders = [...fromOrders, ...o.items]?.map((c) => ({
          ...c,
          checked: true,
          storeObj: {
            id: o.store,
            name: o.storeName
          },
          brand: oneBrand
        }));
        if (o.discounts.length > 0) {
          o.discounts.forEach(function (d) {
            let existIndex = discountPerBrand.findIndex((xd) => {
              return (
                xd.discount.promotion === d.promotion &&
                xd.discount.voucher === d.voucher
              );
            });
            if (existIndex > -1) {
              discountPerBrand[existIndex].discount.amount += parseFloat(
                d.amount
              );
              return;
            }
            discountPerBrand.push({
              discount: d,
              store: o.storeName,
              storeId: o.store,
            });
          });
        }
        if (o.extraCharges.length > 0) {
          o.extraCharges.forEach(function (e) {
            outletExtraCharges.push({
              store: o.storeName,
              storeId: o.store,
              extraCharges: e,
            });
          });
        }
      });

      let promoCodes = [];
      let removedPromos = response.removedPromos || [];

      if (discs.length) {
        discs.forEach((d) => {
          if (!d.promotion) return;
          if (d.voucher) return;
          let reasons = d.reason.split("Promo Code: ");
          let prm = reasons.length > 1 ? reasons[1] : null;
          if (prm && promoCodes.indexOf(prm) == -1) promoCodes.push(prm);
        });
      }

      if (discountPerBrand.length) {
        discountPerBrand.forEach((d) => {
          if (!d.discount.promotion) return;
          if (d.discount.voucher) return;
          let reasons = d.discount.reason.split("Promo Code: ");
          let prm = reasons.length > 1 ? reasons[1] : null;
          if (prm && promoCodes.indexOf(prm) == -1) promoCodes.push(prm);
        });
      }
      const currentMaxRedeemedPoints = self.$store.getters.getMaxRedeemedPoints;
      self.$store.dispatch("setMaxRedeemedPoints", {
        ...currentMaxRedeemedPoints,
        [outletCode]: response.order.maxRedeemedPoints
      });
      orderRequest.total = response.order.total;
      orderRequest.subTotal = response.order.subTotal;
      let currentCartIds = self.$store.getters.getCartId || {};
      if (response.cartId) {
        self.$store.dispatch("setCartId", {
          ...currentCartIds,
          [outletCode]: response.cartId
        });
      }

      orderRequest.draft = false;
      orderRequest.cartId = null;
      let currentOutletExtraCharges = self.$store.getters.getOutletExtraCharges || {};
      let currentDiscountPerBrand = self.$store.getters.getDiscountPerBrand || {};
      let currentPromocodes = self.$store.getters.getPromoCodes || {};
      if(!currentPromocodes[outletCode]){
        currentPromocodes[outletCode] = [];
      }
      currentPromocodes[outletCode] = Array.from(new Set([...currentPromocodes[outletCode], ...promoCodes]));
      let currentAutoPromos = self.$store.getters.getAutoPromoCodes || {};
      self.$store.dispatch("setOutletExtraCharges", {
        ...currentOutletExtraCharges,
        [outletCode]: outletExtraCharges
      });
      self.$store.dispatch("setDiscountPerBrand", {
        ...currentDiscountPerBrand,
        [outletCode]: discountPerBrand
      });
      self.$store.dispatch("setPromoCodes", currentPromocodes);
      self.$store.dispatch("setOrderRequest", {
        ...parentOrderRequest,
        [outletCode]: orderRequest
      });
      self.$store.dispatch("setAutoPromocodes", {
        ...currentAutoPromos,
        [outletCode]: removedPromos
      });

      let store = self.$store.getters.getCurrentStore;
      carts = carts.filter((c) => {
        if (!c.checked) return true;
        return (
          fromOrders.filter((fo) => {
            if (c.freeProduct) return fo.product == c.product.id && fo.total == 0;
            let ok = fo.product == c.product.id && fo.variant == c.variant?.id;
            if(!ok) return false;
            if(fo.modifiers?.length){
              let selectedModifiers = fo.modifiers.filter((md) => c.modifiers?.filter((mm) => mm.modifierId == md.modifierId).length > 0);
              return c.modifiers.length == selectedModifiers.length;
            }
            return true;
          }).length > 0
        );
      });

      let notInTheCart = [];
      let promoItems = [];
      let cartIndexes = [];
      fromOrders.forEach((oi, oix) => {
        let ix = carts.findIndex((it) => {
          let ok = it.product.id == oi.product && it.variant?.id == oi.variant;
          if(!ok) return false;
          if(oi.modifiers?.length > 0 || it.modifiers?.length > 0){
            let selectedModifiers = oi.modifiers.filter((md) => it.modifiers?.filter((mm) => mm.modifierId == md.modifierId).length > 0);
            return it.modifiers.length == selectedModifiers.length;
          }
          return true;
        });
        if (ix == -1) {
          if (oi.total == 0 || oi.promotion != null) {
            let poi = { ...oi, ...{ index: oix } };
            promoItems.push(poi);
          } else notInTheCart.push(oi);
        } else if(!cartIndexes.includes(ix)) {
          cartIndexes.push(ix);
          let samePrice = carts[ix].accPrice == oi.total;
          let sameQty = carts[ix].quantity == oi.quantity;
          if (samePrice && sameQty) return;
          if (oi.total == 0 || oi.promotion != null) {
            let poi = { ...oi, ...{ index: oix } };
            promoItems.push(poi);
          } else {
            carts[ix].accPrice = oi.total;
            carts[ix].quantity = oi.quantity;
          }
        }
      });
      if (!isEmpty(notInTheCart)) {
        notInTheCart.forEach(async(one) => {
          let prd = self.$store.getters.getProducts.find((p) => {
            return p.id == one.product;
          });
          if (!prd) {
            const js = await productService.retrieveProductsList({
              productId: one.product,
              pageNumber: 0,
              pageSize: 1,
            });
            prd = js.products.find((p) => p.id == one.product);
            if(prd){
              prd.brands = js.brands.filter((b) => b.apiCode == prd.brand);
            } else {
              prd = {
                id: one.product,
                imageId: one.imageId,
                name: one.productName,
              };
            }
          }
          carts.push({
            id: cartsCount,
            showEdit: false,
            product: prd,
            quantity: one.quantity,
            variant: one.variant,
            modifierGroups: one.modifierGroups || [],
            price: one.total / one.quantity,
            accPrice: one.total,
            specialInstructions: "",
            modifiers: one.modifiers || [],
            storeName: one.storeObj.name,
            storeId: one.storeObj.id,
            processing: true,
            freeProduct: "",
            checked: true,
          });
          cartsCount += 1;
        });
      }
      let notFoundPromoItems = [];
      const manageNotFoundPromoItems = () => {
        if (notFoundPromoItems.length > 0) {
          notFoundPromoItems.forEach((prd) => {
            if (!carts[prd.index]) return;
            if (carts[prd.index].product.id == prd.product) {
              carts[prd.index].quantity = prd.quantity;
              carts[prd.index].accPrice = prd.total;
            } else {
              carts.push({
                id: cartsCount,
                showEdit: false,
                product: {
                  id: prd.id,
                  imageId: prd.imageId,
                  name: prd.productName,
                },
                quantity: prd.quantity,
                variant: prd.variant,
                modifierGroups: prd.modifierGroups || [],
                price: prd.total / prd.quantity,
                accPrice: prd.total,
                specialInstructions: "",
                modifiers: prd.modifiers || [],
                storeName: store ? store.name : "",
                storeId: store ? store.id : "",
                processing: true,
                freeProduct: "",
                checked: true,
              });
              cartsCount += 1;
            }
          });
          if (promoCodes) {
            let nf = notFoundPromoItems.map((n) => n.product);
            promoCodes.forEach((pc) => {
              let pcarts = carts.filter(
                (c) => c.freeProduct != pc && nf.includes(c.product.id)
              );
              pcarts.sort((a, b) => a.quantity - b.quantity);
              if (pcarts.length > 0) {
                let cartIx = carts.findIndex(
                  (c) =>
                    c.product.id == pcarts[0].product.id &&
                    c.quantity == pcarts[0].quantity
                );
                if (cartIx == -1) return;
                let applied = carts.find(
                  (c) =>
                    c.product.id == carts[cartIx].product.id &&
                    c.id != carts[cartIx].id
                );
                if (applied && applied.freeProduct == pc) return;
                carts[cartIx].freeProduct = pc;
              }
            });
          }
        }
      };
      const finalizing = () => {
        manageNotFoundPromoItems();
        
        bankCarts = self.$store.getters.getCarts || {};
        let maxId = 0;
        for(let k in bankCarts) {
          if(k != outletCode) {
            let maxIds = bankCarts[k].map((it) => it.id);
            maxId = Math.max(...maxIds) + 1;
          } else {
            carts.map((c, ix) => {
              c.id = ix + maxId;
              return c;
            });
          }
        }
        
        if (carts.length < fromOrders.length) {
          let diff = fromOrders.filter((a) => {
            return (
              carts.filter((c) => {
                return c.product.id !== a.product;
              }).length > 0
            );
          });
          if (diff.length) {
            let newCarts = diff.map((one) => {
              let prd = this.$store.getters.getProducts.find((p) => {
                return p.id == one.product;
              });
              if (!prd) {
                prd = {
                  id: one.product,
                  imageId: one.imageId,
                  name: one.productName,
                };
              }
              return {
                id: cartsCount,
                showEdit: false,
                product: {
                  ...prd,
                  brands: one.brand ? [one.brand] : [],
                  brandNames: one.brand?.name
                },
                quantity: one.quantity,
                variant: one.variant,
                modifierGroups: one.modifierGroups || [],
                price: one.total / one.quantity,
                accPrice: one.total,
                specialInstructions: "",
                modifiers: one.modifiers || [],
                storeName: one.storeObj.name,
                storeId: one.storeObj.id,    
                processing: true,
                freeProduct: "",
                checked: true,
                outletStore: {
                  ...thisOutlet,
                  brand: one.brand
                }
              };
            });
            carts = [...carts, ...newCarts];
            self.$store.dispatch("setCarts", {
              ...bankCarts,
              [outletCode]: carts
            });
          }
        }
        self.$store.dispatch("setCarts", {
          ...bankCarts,
          [outletCode]: carts
        });
        callbackSuccess(response);
      };
      const checkPromoItems = async () => {
        let res = await getPromotions(outletCode);
        promoItems.forEach((p) => {
          let prm = res.promotions.find((it) => {
            return it.freeProduct && it.freeProduct.id == p.product;
          });
          if (prm && prm.benefitType == "FREE_ITEM") {
            let prd = prm.freeProduct;
            let one = promoItems.find((c) => {
              return c.product == prd.id;
            });
            if (one) {
              let cart = {
                id: cartsCount,
                showEdit: false,
                product: {
                  ...prd,
                  brands: one.brand ? [one.brand] : [],
                  brandNames: one.brand?.name
                },
                quantity: one.quantity,
                variant: one.variant,
                modifierGroups: one.modifierGroups || [],
                price: one.total / one.quantity,
                accPrice: one.total,
                specialInstructions: "",
                modifiers: one.modifiers || [],
                storeName: p.storeObj.name,
                storeId: p.storeObj.id,
                processing: true,
                freeProduct: prm.code,
                checked: true,
                outletStore: {
                  ...thisOutlet,
                  brand: one.brand
                }
              };
              let cprd = carts.find((c) => {
                return c.product.id == cart.product.id && c.price == 0;
              });
              if (!cprd) {
                carts.push(cart);
                cartsCount += 1;
              }
            }
          } else {
            let prd = promoItems[0];
            notFoundPromoItems.push(prd);
          }
        });
        finalizing();
      };
      if (!isEmpty(promoItems)) {
        await checkPromoItems();
      } else {
        finalizing();
      }
    },
    async failedOrder(error) {
      let rollbackAtError =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : true;
      let callbackError =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      let outletCode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      let self = this;
      let parentOrderRequest = this.$store.getters.getOrderRequest || {};
      let orderRequest = parentOrderRequest[outletCode] || {};
      let parentCarts = this.$store.getters.getCarts || {};
      let carts = parentCarts[outletCode] || [];
      if (isEmpty(error.items) && rollbackAtError) {
        carts.pop();
        self.$store.dispatch("setCarts", {
          ...parentCarts,
          [outletCode]: carts
        });
      }
      /*
      let showAlert = true;
      let items = null;
      let callTestOrder = false;
      let vouchersError = [];
      let promoCodesError = [];
      if(!isEmpty(error.vouchers) || !isEmpty(error.promoCodes)){
        callTestOrder = true;
        API.Promotion.getPromotion(function (json) {
          promotionList = json.promotions || promotionList;
        });
        showAlert = false;
        if(orderRequest.orders === undefined){
          items = orderRequest.items;
        }else{
          items = orderRequest.orders[0].items;
        }
      }
      if (!isEmpty(error.vouchers)) {
        vouchersError = error.vouchers;
      }

      if (!_.isEmpty(error.promoCodes)) {
        promoCodesError = error.promoCodes;
      }
      */

      orderRequest.draft = false;
      orderRequest.cartId = null;
      self.$store.dispatch("setOrderRequest", {
        ...parentOrderRequest,
        [outletCode]: orderRequest
      });
      callbackError(error);
    },
    mapCartOutlets() {
      let outletList = this.$store.getters.getOutlets;
      let parentCarts = this.$store.getters.getCarts || {};
      let keys = Object.keys(parentCarts);
      return keys.map((key) => {
        return outletList.find((outlet) => {
          return outlet.apiCode == key
        });
      });
    },
    mapProductCategories() {
      let parents = [
        { 
          name: "Apparel", 
          subCategories: ["Men", "Women", "Kids"],
          hasChildren: true,
          itemsOnly: [],
          children: [
            {
              name: "Men",
              items: ["Tops","Bottoms","Outwear","Swimwear"]
            },
            {
              name: "Women",
              items: ["Tops","Bottoms","Outwear","Swimwear"]
            },
            {
              name: "Kids",
              items: ["Tops","Bottoms","Outwear","Swimwear"]
            },
          ]
        },
        { 
          name: "Footwear", 
          subCategories: ["Men", "Women", "Unisex", "Kids"],
          hasChildren: true,
          itemsOnly: [],
          children: [
            {
              name: "Men",
              items: ["Slides","Slippers","Sandals","Sneakers","Performance Shoes","Aqua Shoes","Winter Boots"]
            },
            {
              name: "Women",
              items: ["Slides","Slippers","Sandals","Sneakers","Performance Shoes","Aqua Shoes","Winter Boots"]
            },
            {
              name: "Unisex",
              items: ["Slides","Slippers","Sandals","Sneakers","Performance Shoes","Aqua Shoes","Winter Boots"]
            },
            {
              name: "Kids",
              items: ["Slides","Slippers","Sandals","Aqua Shoes"]
            },
          ]
        },
        { 
          name: "Bag", 
          subCategories: [],
          hasChildren: true,
          itemsOnly: ["Duffle Bags","Backpacks","Belt Bags","Tote Bags","Crossbody","Dry Bags","Laptop Bags","Luggage"],
          children: []
        },
        { 
          name: "Equipment", 
          subCategories: [],
          hasChildren: true,
          itemsOnly: ["Camping","Wellness"],
          children: []
        },
        { 
          name: "Accessories", 
          subCategories: [],
          hasChildren: true,
          itemsOnly: ["Hydration","Sports","Outdoor","Travel","Fashion","Biking"],
          children: []
        },
      ];
      return parents;
      /*
      let mapped = parents.map((parent) => {
        let excludeParents = parents
          .filter((p) => p.name.toLowerCase() != parent.name.toLowerCase())
          ?.map((p) => p.name);
        parent.itemsOnly = [];
        parent.children = [];
        if (isEmpty(parent.subCategories)) {
          parent.itemsOnly = this.fetchSubCategories([parent.name]);
        } else {
          parent.children = parent.subCategories.map((sub) => {
            return {
              name: sub,
              items: this.fetchSubCategories(
                [parent.name, sub],
                [...parent.subCategories, ...excludeParents]
              ),
            };
          });
        }
        parent.hasChildren =
          parent.children.length > 0 || parent.itemsOnly.length > 0;
        return parent;
      });
      console.log("---categories napped", mapped);
      return mapped;
      */
    },
    fetchSubCategories(parentNames, items) {
      if (!items) items = [];
      let products = this.$store.getters.getProducts;
      let categories = this.$store.getters.getCategories.filter((c) => {
        return products.filter((p) => p.categories.includes(c.id)).length > 0;
      });
      let parentCats = categories.filter((c) =>
        parentNames.map((p) => p.toLowerCase()).includes(c.name.toLowerCase())
      );
      let prds = products.filter((p) => {
        return (
          p.categories.filter((c) => {
            return parentCats.map((m) => m.id).includes(c);
          }).length > 0
        );
      });
      let subCategories = [];
      for (let i = 0; i < prds.length; i++) {
        if (prds[i].categories.length > 0) {
          let ctgs = prds[i].categories?.map((c) => {
            return categories.find((it) => it.id == c);
          });
          subCategories = [
            ...subCategories,
            ...ctgs
              .filter((ctg) => {
                return !subCategories
                  ?.map((sc) => sc.toLowerCase())
                  .includes(ctg.name.toLowerCase());
              })
              ?.map((c) => c.name),
          ];
        }
      }
      let res = subCategories.filter((c) => {
        return !parentNames
          .map((p) => p.toLowerCase())
          .includes(c.toLowerCase());
      });
      if (!isEmpty(items)) {
        let excludes = items.filter(
          (it) =>
            !parentNames.map((p) => p.toLowerCase()).includes(it.toLowerCase())
        );
        res = res.filter((r) => {
          return !excludes
            .map((x) => x.toLowerCase())
            .includes(r.toLowerCase());
        });
      }
      return res;
    },
    activityCategory() {
      let hq = this.$store.getters.getHeadquarter;
      let app = hq?.headquarter?.app?.properties || {};
      return app?.activityCategoryName;
    },
    collectBrandsList() {
      let hq = this.$store.getters.getHeadquarter;
      let brands = [];
      if (
        !isEmpty(hq) &&
        !isEmpty(hq.headquarter) &&
        !isEmpty(hq.headquarter.brand)
      ) {
        brands = hq.headquarter.brand;
      }
      if (!isEmpty(brands)) {
        brands.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        return brands?.map((brand) => {
          let stores = [];
          for(let i = 0; i < hq.outlets.length; i++){
            stores = [
              ...stores, 
              ...hq.outlets[i].stores.filter((s) => {
                return s.brandCode == brand.apiCode
              })?.map((s) => {
                let isOpenToday = false;
                let hours = s.openingHours;
                let now = moment();
                let day = moment.tz(now, "Asia/Singapore").format("dddd").toUpperCase();
                let date = moment.tz(now, "Asia/Singapore").format("YYYY-MM-DD");
                let todayHour = hours?.find((h) => h.dayOfWeek == day);
                if(todayHour && (s.takeAway || s.delivery)){
                  let from = moment.tz(`${date} ${todayHour.startTime}`, "Asia/Singapore");
                  let to = moment.tz(`${date} ${todayHour.endTime}`, "Asia/Singapore");
                  if(now.isBetween(from, to, null, "[]")){
                    isOpenToday = true;
                  }
                  s.gap = now.isBetween(from, to, null, "[]")
                  s.from = from;
                  s.to = to;
                }
                s.day = day;
                s.date = date;
                s.todayHour = todayHour
                s.isOpenToday = isOpenToday;
                s.now = now;
                return s;
              })
            ];
          }
          return {
            ...brand,
            stores: stores
          }
        })
      }
      return brands;
    },
    isInventoryEnabled(brandCode){
      let brand = this.collectBrandsList().find((b) => b.apiCode == brandCode);
      let hq = this.$store.getters.getHeadquarter;
      if(hq?.headquarter?.enableInventory){
        if(brand && !brand.enableInventory) return false;
        return true;
      }
      return brand?.enableInventory == true;
    },
    isOrderOmisell() {
      // return this.$store.getters.getDineType == "RETAIL_DELIVERY";
      let stores = this.mapCartOutlets();
      let outlets = [];
      let keys = Object.keys(stores);
      for (var i = 0; i < keys.length; i++) {
        outlets.push(stores[keys[i]]);
      }
      return (
        outlets.filter((o) => {
          let storeEnabled = o?.stores?.filter((s) => s.delivery).length > 0;
          let customEnabled = o?.custom?.useRetailDeliveryOrdertype == true;
          return (
            customEnabled &&
            storeEnabled
          );
        }).length > 0
      );
    },
    resetCart() {
      this.$store.dispatch("clearBooking");
      this.$store.dispatch("setOrderRequest", {});
      this.$store.dispatch("setCartId", null);
      this.$store.dispatch("setDiscounts", []);
      this.$store.dispatch("setPromoCodes", []);
      this.$store.dispatch("setDiscountPerBrand", []);
      this.$store.dispatch("setOutletExtraCharges", []);
      this.$store.dispatch("setExtraCharges", []);
      this.$store.dispatch("setEtaTime", null);
      this.$store.dispatch("setBusy", false);
      this.$store.dispatch("setPointUsed", 0);
      this.$store.dispatch("setTotalPoint", 0);
      this.$store.dispatch("setMaxRedeemedPoints", 0);
      this.$store.dispatch("setCarts", []);
      this.$store.dispatch("setDeliveryAddress", null);
      this.$store.dispatch("setAutoPromocodes", []);
      this.$store.dispatch("setDineType", "RETAIL");
      localStorage.removeItem("cart");
    },
    setupProducts(products) {
      let parentCarts = this.$store.getters.getCarts || {};
      let carts = [];
      for(let k in parentCarts){
        carts = [...carts, ...parentCarts[k]];
      }
      return products.map((prd) => {
        prd.cart = carts.find((cart) => {
          return cart.product?.id == prd.id;
        });
        if (prd.cart?.product?.cart) {
          delete prd.cart?.product?.cart;
        }
        if (!isEmpty(prd.brands)) {
          prd.brands?.forEach((brand) => {
            brand.products?.forEach((p) => {
              if (p.brands) p.brands.forEach((bb) => delete bb.products);
            });
          });
        }
        return prd;
      });
    },
    async retrieveCartDetails(cartId, outletCode) {
      let callback =
        arguments.length > 2 && arguments[2] !== undefined
          ? arguments[2]
          : function () {};
      // let outletCode = this.getOutletCode();
      let res = await getCart(cartId, outletCode);
      if (!res.success) {
        return callback({
          carts: [],
          message: res.message,
        });
      }
      let outlets = this.$store.getters.getOutlets || [];
      let prds = this.$store.getters.getProducts;
      this.$store.dispatch("setCartId", cartId);

      let orderRequest = {
        app: EUNOIA_CONFIG.app,
        cartId: cartId,
        customer: {
          firstName: res.order.customer.firstName,
          lastName: res.order.customer.lastName,
          phone: res.order.customer.phone,
          email: res.order.customer.email,
        },
        draft: false,
        test: true,
        fulfillmentTime: null,
        orders: [],
      };

      let carts = [];
      let currentStore = this.$store.getters.getCurrentStore;
      let currOutlet = outlets.find((ou) => {
        if (!isEmpty(res.order.outlet)) return ou.id == res.order.outlet.id;
        return ou.stores.filter((s) => s.id == currentStore.id).length > 0;
      });
      this.$store.dispatch("setCurrentOutlet", currOutlet);
      this.$store.dispatch(
        "setCurrentStore",
        currOutlet.stores.find((s) => s.id == res.order.orders[0].store)
      );
      let reloadOrders = res.order.orders.map((order) => {
        let outlet = outlets.find((outlet) => {
          return outlet.stores.find((s) => {
            return s.id == order.store;
          });
        });
        return {
          order: order,
          outlet: outlet,
          store: outlet.stores.find((s) => {
            return s.id == order.store;
          }),
        };
      });

      const mapOrders = (order, products) => {
        orderRequest.orders.push({
          type: order.type,
          store: order.store,
          fulfillmentTime: order.fulfillmentTime,
          items: order.items.map((n) => {
            return {
              specialRequest: n.specialRequest,
              quantity: n.quantity,
              product: n.product,
              modifiers: n.modifiers,
              variant: n.variant,
              storeName: order.storeName,
            };
          }),
        });
        order.items.forEach(async (item) => {
          let prd = products.find((p) => {
            return p.id == item.product;
          });
          if (!prd) {
            prd = {
              id: item.product,
              imageId: item.imageId,
              name: item.productName,
            };
          }
          carts.push({
            id: carts.length,
            product: prd,
            quantity: item.quantity,
            variant: {
              id: item.variant,
              name: item.variantName,
              price: item.variantPrice,
            },
            modifiers: item.modifiers,
            modifierGroups: prd.modifierGroups,
            accPrice: item.total,
            price: item.total / item.quantity,
            storeName: order.storeName,
            storeId: order.store,
            specialInstructions: item.specialRequest,
            checked: true,
          });
        });
        let cust = this.$store.getters.getCustomer;
        if (order.address && cust) {
          let addr = cust.addresses.find(
            (add) => add.string == order.address.string
          );
          if (addr) this.$store.dispatch("setDeliveryAddress", addr);
        }
      };

      const checkNext = async (outletApiCode) => {
        if (!isEmpty(reloadOrders)) {
          await doOneOrder(reloadOrders[0]);
        } else {
          if (!isEmpty(res.order.outlet)) {
            currOutlet = outlets.find((ou) => {
              return ou.apiCode == outletApiCode;
            });
            let orderStore = res.order.orders.find((it) => {
              return (
                currOutlet.stores
                  .map((s) => {
                    return s.id;
                  })
                  .indexOf(it.store) > -1
              );
            });
            if (isEmpty(orderStore)) {
              orderStore = res.order.orders[0];
              this.$store.dispatch("setInited", false);
              return this.goToWithParams("CartPage", {
                cartId: cartId,
                outletCode: outlets.find((o) => {
                  return o.stores.find((s) => {
                    return s.id == orderStore.store;
                  });
                }).apiCode,
              });
            }
            currentStore = currOutlet.stores.find((s) => {
              return s.id == orderStore.store;
            });
            this.$store.dispatch("setCurrentOutlet", currOutlet);
            this.$store.dispatch("setCurrentStore", currentStore);
          }

          this.$store.dispatch("setOrderRequest", orderRequest);
          let storedCarts = this.$store.getters.getCarts;
          if (storedCarts.length > 0) {
            let cartPrds = carts.map((x) => x.product.id);
            storedCarts = storedCarts.filter((it) => {
              return !cartPrds.includes(it.product.id);
            });
            carts = [...carts, ...storedCarts];
          }
          this.$store.dispatch("setCarts", carts);

          let freeProducts = carts
            .map((c, x) => {
              return { price: c.price, index: x, cart: c };
            })
            .filter((c) => {
              return c.price == 0;
            });

          const updateFreeProducts = async () => {
            let json = await getPromotions(outletCode);
            let prm = json.promotions.find((it) => {
              return (
                it.benefitType == "FREE_ITEM" &&
                it.freeProduct &&
                it.freeProduct.id == carts[freeProducts[0].index].product?.id
              );
            });
            if (prm) {
              carts[freeProducts[0].index].freeProduct = prm.code;
            } else {
              let promoCodes = this.$store.getters.getPromoCodes;
              if (promoCodes) {
                promoCodes.forEach((pc) => {
                  let pcarts = carts.filter(
                    (c) =>
                      c.freeProduct != pc &&
                      freeProducts[0].cart.product.id == c.product.id
                  );
                  pcarts.sort((a, b) => a.quantity - b.quantity);
                  if (pcarts.length > 0) {
                    let cartIx = carts.findIndex(
                      (c) =>
                        c.product.id == pcarts[0].product.id &&
                        c.quantity == pcarts[0].quantity
                    );
                    if (cartIx == -1) return;
                    let applied = carts.find(
                      (c) =>
                        c.product.id == carts[cartIx].product.id &&
                        c.id != carts[cartIx].id
                    );
                    if (applied && applied.freeProduct == pc) return;
                    carts[cartIx].freeProduct = pc;
                  }
                });
              }
            }
            freeProducts.splice(0, 1);
            if (!isEmpty(freeProducts)) {
              return updateFreeProducts();
            }
            callback({ carts: carts });
          };

          await this.successOrder(res, async () => {
            this.$store.dispatch("setCartId", cartId);
            this.$store.dispatch("setCarts", carts);
            if (!isEmpty(freeProducts)) {
              return updateFreeProducts();
            }
            callback({ carts: carts });
          });
        }
      };

      const doOneOrder = async (item) => {
        let products = [];
        if (item.outlet.apiCode == currOutlet.apiCode) {
          products = prds;
          mapOrders(item.order, products);
          reloadOrders.splice(0, 1);
          checkNext(item.outlet.apiCode);
        } else {
          products = [];
          let json = await getMenu({ storeId: item.outlet.apiCode });
          if (!json.success) return checkNext(item.outlet.apiCode);
          json.stores.forEach((st) => {
            products = [...products, ...st.menu.products];
          });
          mapOrders(item.order, products);
          reloadOrders.splice(0, 1);
          checkNext(item.outlet.apiCode);
        }
      };
      await doOneOrder(reloadOrders[0]);
    },
    generateGA(res) {
      let order = res.order;
      let data = {
        event: "purchase",
        ecommerce: {
          transaction_id: res.order.number,
          value: this.amount,
          currency: "PHP",
          items: [],
        },
      };

      if (isEmpty(order)) return data;
      if (isEmpty(order.orders)) return data;

      let outlets = this.$store.getters.getOutlets;
      let products = this.$store.getters.getProducts;
      let categories = this.$store.getters.getCategories;
      let outlet = outlets.find((ou) => {
        return ou.id == order.outlet.id;
      });
      order.orders.forEach((o) => {
        if (isEmpty(o.items)) return;
        o.items.forEach((it) => {
          let prd = products.find((p) => {
            return p.id == it.product;
          });
          let cat = categories.find((c) => {
            return prd?.categories?.indexOf(c.id) > -1;
          });
          let item = {
            item_id: it.product,
            item_name: it.productName,
            affiliation: outlet ? outlet.name : "",
            coupon: it.promotion,
            discount: 0,
            item_brand: o.brand.name,
            item_category: cat ? cat.name : "",
            price: it.total,
            quantity: it.quantity,
          };
          data.ecommerce.items.push(item);
        });
      });
      return data;
    },
    avatar(name) {
      if (!name) return "";
      let names = name.split(" ");
      let items = [];
      for (var n in names) {
        items.push(names[n].substring(0, 1));
      }
      return items.join("");
    },
    async retrieveReviewRatings(event) {
      try {
        let eventId = event?.id;
        let reviewsList = [];
        if (Object.prototype.hasOwnProperty.call(event, "reviews")) {
          reviewsList = event.reviews;
        } else {
          let result = await eventService.getEventReviews(eventId);
          reviewsList = result.success ? result.reviews : [];
        }

        reviewsList.map((it) => {
          let stars = [];
          let rating = Math.floor(it.rating / 2);
          let diff = it.rating % 2;
          for (let i = 0; i < rating; i++) {
            stars.push({ icon: "star", rated: 2 });
          }
          if (diff > 0) stars.push({ icon: "star_half", rated: 1 });
          let len = stars.length;
          if (len < 5) {
            for (let n = 0; n < 5 - len; n++) {
              stars.push({ icon: "star", rated: 0 });
            }
          }
          it.stars = stars;
          let date = moment
            .tz(it.createdAt.substring(0, 10), "Asia/Singapore")
            .format("DD MMM YYYY");
          it.createdDate = date;
          return it;
        });
        let totalRatings = reviewsList
          .map((it) => {
            return it.rating;
          })
          .reduce((a, b) => a + b, 0);
        let maxRates = reviewsList.length * 10;
        let calcRate = (totalRatings / maxRates) * 10;
        let ratingPoints = (calcRate / 2).toFixed(1);
        if (isNaN(ratingPoints)) ratingPoints = 0;
        let ratings = Math.floor(ratingPoints);
        let diffRate = calcRate % 2;
        let ratingStars = [];
        for (let i = 0; i < ratings; i++) {
          ratingStars.push({ icon: "star", rated: 2 });
        }
        if (diffRate > 0) ratingStars.push({ icon: "star_half", rated: 1 });
        let starsLen = ratingStars.length;
        if (starsLen < 5) {
          for (let n = 0; n < 5 - starsLen; n++) {
            ratingStars.push({ icon: "star", rated: 0 });
          }
        }
        let reviewCharts = [
          {
            stars: 5,
            totalReviewed: 0,
            percentage: 0,
          },
          {
            stars: 4,
            totalReviewed: 0,
            percentage: 0,
          },
          {
            stars: 3,
            totalReviewed: 0,
            percentage: 0,
          },
          {
            stars: 2,
            totalReviewed: 0,
            percentage: 0,
          },
          {
            stars: 1,
            totalReviewed: 0,
            percentage: 0,
          },
        ];
        reviewsList.forEach((it) => {
          let n = reviewCharts.findIndex(
            (c) => c.stars == it.stars.filter((s) => s.rated > 0).length
          );
          if (it.rating <= 0) {
            n = reviewCharts.findIndex((c) => c.stars == 1);
          }
          if (n > -1) {
            reviewCharts[n].totalReviewed++;
            reviewCharts[n].percentage = (
              (reviewCharts[n].totalReviewed / reviewsList.length) *
              100
            ).toFixed(2);
          }
        });
        if (reviewsList) {
          reviewsList.sort((a, b) => {
            return b.id - a.id;
          });
        }
        return {
          reviewsList: reviewsList,
          reviewCharts: reviewCharts,
          totalRatings: totalRatings,
          ratingPoints: ratingPoints,
          ratingStars: ratingStars,
        };
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    },
  },
};

export const goTo = (pageName, params) => {
  return router.push({ name: pageName, params });
};

export const isPartOfLinkedNudges = (nudge, allNudges) => {
  const isStart = nudge.tags
    ?.map((it) => it.toLowerCase())
    ?.includes("nudge_1");

  const isPart = allNudges.find((it) => {
    return (
      it.tags?.map((it) => it.toLowerCase())?.includes("nudge_1") &&
      it.links?.includes(nudge.id)
    );
  });

  return isStart || isPart;
};
