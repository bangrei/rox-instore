import store from "@/store";
import { getMenu } from "../connector/v4/productConnector";
import { getOutletDetails } from "../connector/v4/storeConnector";
import initData from "@/init";

export const metaManager = () => {
  let defaultMetaTags = [
    {
      name: "description",
      content: "Join, Experience,and Learn Outdoor Sports!",
    },
    {
      name: "keyword",
      content: "Join, Experience,and Learn Outdoor Sports!",
    },
    {
      property: "og:title",
      content: "Join, Experience,and Learn Outdoor Sports!",
    },
    { property: "og:type", content: "website" },
    {
      property: "og:description",
      content: "Join, Experience,and Learn Outdoor Sports!",
    },
    {
      property: "og:image",
      content: require("@/assets/images/rox-logo-2025.jpeg"),
    },
    {
      property: "og:url",
      content: `${process.env.VUE_APP_BFM_URL}`,
    },
  ];
  let metaTitle = "Recreational Outdoor Exchange";
  let imageUrl = store.getters.cloudinaryURL;

  const getCategoryList = (outletCode) => {
    let categories = [];
    let menus = initData?.outletsMenu;
    if (menus) {
      let res = menus[outletCode];
      let stores = res && res.success ? res.stores : [];
      for (let i = 0; i < stores.length; i++) {
        let menu = stores[i].menu;
        if (menu) {
          for (let n = 0; n < menu.categories.length; n++) {
            let item = menu.categories[n];
            let idx = categories.findIndex((cat) => cat == item.name);
            if (idx == -1) categories.push(item.name);
          }
        }
      }
    }
    return categories;
  };

  const generateMeta = async (to) => {
    if (to.name == "ProductDetails") {
      let prd = {
        name: "Unknown Product",
        description: "No details available",
        imageId: "ohejgftvhxi5jfclyewm",
        image2Id: "",
        image3Id: "",
      };
      let payload = {
        productId: to.params.productId,
        storeId: to.params.outlet,
      };
      let res = await getMenu(payload);
      if (res.success && res.stores) {
        let image = prd.imageId;
        let inventory = res.stores.find(
          (s) => s.menu.product?.id == payload.productId
        );
        let keywords = [];
        if (inventory) {
          prd = inventory.menu.product;
          metaTitle = prd.name;
          if (prd.imageId) image = prd.imageId;
          if (!image) image = prd.image2Id;
          if (!image) image = prd.image3Id;
          keywords = [...keywords, ...[inventory.brand.name]];
          keywords = [...keywords, ...prd?.tags?.map((tag) => tag.name)];
        }
        let description = prd.description;
        if (description) description = description.split(/<[^>]*>/g).join("");
        let metaTags = [
          { name: "description", content: description },
          { property: "og:title", content: prd.name },
          { property: "og:type", content: "product" },
          { property: "og:description", content: description },
          { property: "og:image", content: `${imageUrl}${image}` },
          { property: "og:price:amount", content: prd.price },
          { property: "og:price:currency", content: "PHP" },
          {
            property: "og:url",
            content: `${process.env.VUE_APP_BFM_URL}product/${payload.productId}`,
          },
        ];
        if (keywords) {
          metaTags.push({
            name: "keyword",
            content: keywords.join(", "),
          });
        }
        defaultMetaTags = metaTags;
      }
    } else if (to.name == "ShopPage") {
      const { outlet } = to.params;
      let categories = getCategoryList(outlet);
      let res = await getOutletDetails(outlet);
      if (res.success) {
        let data = res.outlet;
        let brands = [];
        let tags = [];
        if (res.brands) brands = res.brands.map((n) => n.name);
        if (res.storeTags) tags = res.storeTags.map((n) => n.name);
        let description = brands.join(", ");
        if (data.description) {
          description = `${description}. ${data.description}`;
        }
        if (description) description = description.split(/<[^>]*>/g).join(" ");
        if (categories) {
          let desc = [`${description}`, `${categories.join(", ")}`];
          description = desc.join(". ");
        }
        let image = "ohejgftvhxi5jfclyewm";
        if (data.imageId != null) image = data.imageId;
        let keywordString = tags.join(", ");
        let metaTags = [
          { name: "description", content: description },
          { property: "og:title", content: data.name },
          { property: "og:type", content: "website" },
          { property: "og:description", content: description },
          { property: "og:image", content: `${imageUrl}${image}` },
          {
            property: "og:url",
            content: `${process.env.VUE_APP_BFM_URL}shop/${outlet}`,
          },
        ];
        if (keywordString) {
          metaTags.push({
            name: "keyword",
            content: keywordString,
          });
        }
        defaultMetaTags = metaTags;
      }
    }
    return {
      metaTitle,
      defaultMetaTags,
    };
  };
  return {
    generateMeta,
  };
};
