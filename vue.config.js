module.exports = {
  devServer: {
    webSocketServer: "ws",
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Recreational Outdoor Exchange";
      args[0].description = "Join, Experience,and Learn Outdoor Sports!";
      args[0].keyword = "Join, Experience,and Learn Outdoor Sports!";
      return args;
    });

    // Defining app version from package.json
    config.plugin("define").tap((args) => {
      let appVersion = JSON.stringify(require("./package.json").version);
      args[0]["process.env"]["VERSION"] = appVersion;
      return args;
    });
  },
  pwa: {
    themeColor: "#FFFFFF",
    name: "Recreational Outdoor Exchange",
    iconPaths: {
      faviconSVG: "img/icons/rox-favicon-latest.png",
      favicon32: "img/icons/rox-favicon-latest.png",
      favicon16: "img/icons/rox-favicon-latest.png",
      appleTouchIcon: "img/icons/rox-favicon-latest.png",
      maskIcon: "img/icons/rox-favicon-latest.png",
      msTileImage: "img/icons/rox-favicon-latest.png",
    },
    manifestOptions: {
      icons: [
        {
          src: "img/icons/rox-favicon-latest.png",
          sizes: "36x36",
          type: "image/png",
          density: "1",
        },
      ],
    },
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@use "@/assets/scss/base/_variables.scss" as *;`,
      },
    },
  },
};
