## Overview

The idea here is to get you up and running as fast as possible with a new simple application.

## Step One

Install the [**Glue42 Core CLI**](../../what-is-glue42-core/core-concepts/cli/index.html) globally.

```javascript
npm install --global @glue42/cli-core
```

## Step Two

Create a new app directory with a basic html and a basic JS file.

Your directory should look like this:

```cmd
/myApp
    /index.html
    /script.js
``` 

Reference the JS file with a `<script>` tag.

## Step Three

Open a terminal inside the directory and initiate Glue42 Core:

```javascript
gluec init
```

## Step Four

Go to the `index.html` and reference the `@glue42/web` dist file from unpkg. Your html should look like this

```html
<script src="https://unpkg.com/@glue42/web@latest/dist/web.umd.js"></script>
<script src="./script.js">
```

## Step Five

Go to `./script.js`, declare a simple `init` function like this:

```javascript

const init = async () => {
    const glue = await GlueWeb();
    console.log(`Glue initialized with version: ${glue.version}`);
}

init().catch(console.error);

```

## Step Six

Configure the CLI to serve your app and the Glue42 Web script. To do that go over to `glue.config.dev.json` and modify it to look like this:

```json
{
    "glueAssets": ...,
    "server": {
        "settings": ...,
        "apps": [
            {
                "route": "/",
                "file": {
                    "path": "./"
                }
            }
        ],
        "sharedAssets": []
    }
}
```

## Step Seven

Launch your app:

```javascript
gluec serve
```

Now when you head over to `localhost:4242` your app will be served and if you open the console you will see the printed message that Glue is initialized.

This is how you get from 0 to Glue42 Core App as quickly as possible. For more information on setting up your [**Glue42 Core Environment**](../../what-is-glue42-core/core-concepts/environment/index.html), head over to Setting Up [**Single Application**](../setting-environment/single-application/index.html). Or if you wish to launch a React app, you can check out our [**React library**](../setting-application/react/index.html).
