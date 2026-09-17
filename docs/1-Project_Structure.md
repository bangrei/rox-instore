### Project Structure

```
/project-root
|─── /dist
|	- production ready files
│
└─── /docs
│	- comprehensive documentations
│	│
│	└─── 1-Project-Structure.md
│	└─── 2-Development-Deployment.md
│
└─── /src
|	- application source files
│	│
│	└─── /assets
│	│	└─── /images
│	│	│	- static images
│	│	│
│	│	└─── /scss
│	│	│	└─── /base
│	│	│	│	└─── _custom.scss
│	│	│	│	│	- custom style to overwrite global style
│	│	│	│	│
│	│	│	│	└─── _font-icon.scss
│	│	│	│	│	- font-icon style
│	│	│	│	│
│	│	│	│	└─── _reset.scss
│	│	│	│	│	- CSS reset style
│	│	│	│	│
│	│	│	│	└─── _typography.scss
│	│	│	│	│	- font-family style
│	│	│	│	│
│	│	│	│	└─── _variables.scss
│	│	│	│	│	- color and theme style
│	│	│	│	│
│	│	│	│	└─── _global.scss
│	│	│	│		- global style
│	│	│	│	
│	│	└─── main.scss
│	│			- base scss compilation
│	│
│	└─── /bloc
│	│	└─── /model
│	│	│	└─── xxx.js (menu.js, customer.js, etc)
│	│	│	
│	│	└─── /services
│	│		└─── xxxService.js (menuService.js, customerService.js)
│	│	
│	└─── /connector
│	│	└─── apiConfig.js
│	│	│	- API function Wrapper
│	│	│
│	│	└─── xxxConnector.js (menuConnector.js, customerConnector.js)
│	│	
│	└─── /components
│	│	└─── /base
│	│	│	- base components of SD Design System
│	│	│	│
│	│	│	└─── Basexxx.vue
│	│	│
│	│	└─── /layout
│	│	│	- base layouts of SD Design System
│	│	│	│
│	│	│	└─── LayoutVariantxxx.vue
│	│	│
│	└─── /router
│	│	- vue-router routing config
│	│
│	└─── /store
│	│	- vuex state management config
│	│
│	└─── /stories
│		- storybook component documentation
│
└─── .browserslistrc
│
│
└─── eslintrc.js
│
│
└─── package.json
│
│
└─── package-lock.json
│
│
└─── README.md
│
│
└─── vue.config.js
```

