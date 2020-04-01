## Overview

Maybe you don't like using scaffolding tools or maybe you just have a complex and custom case, and the built-in functionality just doesn't suite you. No problem, now we will go through manually setting your Glue42 Core Environment.

### Step One

Go to your application's root and install the necessary Glue42 Core dependencies:

```javascript
npm install --save @glue42/gateway-web @glue42/worker-web
```

### Step Two

Now you have to create the `glue.config.json` and define all the properties you need. You can get a detailed information on the available properties in the Glue42 Core Environment **TODO: Link** section.

**Note** that this file is optional, so if you won't use it just skip this step and Glue42 Core will continue with defaults.

### Step Three

Now you need to serve your application and the Glue42 Core Environment.

By default:
- Glue42 Clients will look for `/glue/glue.config.json` to get user-level configs.
- Glue42 Clients will look for `/glue/worker.js`
- The worker will look for `/glue/gateway.js` and `/glue/glue.config.json`

You should serve:
- the gateway from `./node_modules/@glue42/gateway-web/web/gateway-web.js`
- the worker from `./node_modules/@glue42/worker-web/dist/worker.js`

If you don't want to use a `glue.config.json`, then you need to specify that when initializing a Glue42 Client **TODO: Link**.

If you would like to serve the Glue42 Core environment from a different route, for example from `/my/other/assets/`, then you need to:
- serve all environment assets at the same level (so that they are siblings)
- configure the Glue42 Clients **TODO: Link** to look for a config or a worker at the right route.

Example with a `glue.config.json`:

```text
routes
    /my/other/assets/worker.js
    /my/other/assets/gateway.js
    /my/other/assets/glue.config.json
```

```javascript
// Glue42 Client
// Glue42Web config
const config = {
    extends: "/my/other/assets/glue.config.json"
}
```

Example without a `glue.config.json`:

```text
routes
    /my/other/assets/worker.js
    /my/other/assets/gateway.js
```

```javascript
// Glue42 Client
// Glue42Web config
const config = {
    worker: "/my/other/assets/worker.js"
}
```

We touched on all major steps needed to manually set up your environment, but also keep in mind that you can partially use the CLI. You can use

```javascript
gluec init
```

Just to set up the necessary files for you and then you can serve them using your own dev setup.