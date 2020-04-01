## Overview

We have already covered how to set up your environment for a [Single Application](../../setting-environment/single-application/index.html) and [Multiple Applications](../../setting-environment/multiple-applications/index.html). Now we will take a look at how to initialize a simple Vanilla JS app as a [Glue42 Client](../../../what-is-glue42-core/core-concepts/glue42-client/index.html).

We will assume that the application is a simple, light app, with just an index.html and a couple of JS files.

## Prerequisites 

We will assume that this is the only application in the project and that you have already did the environment setup. Next we need to reference `@glue42/web` in the `index.html` which will connect our client to the [environment](../../../what-is-glue42-core/core-concepts/environment/index.html) and give us access to the Glue42 Web API **TODO**.

## Set up Glue42 Web

The easiest way to use unpkg.

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
<script src="./index.js">
```

We are using `web.umd.js` just to keep it simple, this script will attach a factory function `GlueWeb` to the `window` object.

Next we go to the `./index.js`, which in our example is just a simple JS file with an `init` method and we initialize Glue42 Web.

```javascript
const init = async () => {

    const glue = await GlueWeb();

    // here glue is initialized, the app has connected to the Glue42 Environment
    // your custom app logic here
};

init().catch(console.error);
```

When `GlueWeb()` resolves, we get a `glue` object which we can use to access the full Glue42 Web API **TODO**. By default we are not required to pass a config object to `GlueWeb()`, but if you wish you can do so. Check out the [Glue42 Client](../../../what-is-glue42-core/core-concepts/glue42-client/index.html) section for more info on the possible options.

That's it, the application is now configured as a [Glue42 Client](../../../what-is-glue42-core/core-concepts/glue42-client/index.html) and can connect to the [Glue42 Environment](../../../what-is-glue42-core/core-concepts/environment/index.html).

What remains now is to serve it. You can do that with your own server or you can use the [Glue42 Core CLI](../../../what-is-glue42-core/core-concepts/cli/index.html) as we have shown in the [Single Application](../../setting-environment/single-application/index.html) setup page.
