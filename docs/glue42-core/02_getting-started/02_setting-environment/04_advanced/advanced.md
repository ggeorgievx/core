## Overview

So far we have covered the default, straight forward initiation. But what if you need a little bit more control? By going over the `glue.config.dev.json` you can change the port of the dev server, the sources of the [**Glue42 Core environment**](../../../what-is-glue42-core/core-concepts/environment/index.html) files, the logging of the [**CLI**](../../../what-is-glue42-core/core-concepts/cli/index.html) and so on. If you are interested, head over to the [**CLI section**](../../../what-is-glue42-core/core-concepts/cli/index.html).

## Extending the Gateway's logging

You can get detailed information on what the gateway is from the [**Glue42 Core environment**](../../../what-is-glue42-core/core-concepts/environment/index.html) section. Here we will explain how you can extend it's logging functionality. Normally this is something you do not need to to, because the gateway logs internal messages to and from [**Clients**](../../../what-is-glue42-core/core-concepts/glue42-client/index.html), but obtaining this information could be useful for creating bug issues in our github or just to get a better understanding on what's going on behind the scenes.

First, you need to create an `appender`. This is a simple JS function which takes as a single argument the log info object and does with it whatever you need - log to the console, send to a REST server, etc. To do that, go to your application's root and create:

```javascript
// ./gwLogAppender.js
self.myLog = (logInfo) => {
    // your log logic here
};
```

Next, go to `glue.config.dev.json` to tell the CLI that there is an appender:

```json
{
    // some other stuff
    "glueAssets": {
        "gateway":{
            "gwLogAppender": "./gwLogAppender.js"
        }
    }
    // some other stuff
}
```

Finally go to `glue.config.json` to tell the runtime [**Environment**](../../../what-is-glue42-core/core-concepts/environment/index.html), what there is a custom appender:

```json
{
    // some other stuff
    "gateway":{
        "logging": {
            "appender": {
                "name": "myLog", // notice that this is the name of the JS function in ./gwLogAppender.js,
                "location": "./gwLogAppender.js"
            }
        }
    }
    // some other stuff
}
```

Now, when you `gluec serve`, the appender will be hosted and it will be detected by the runtime [**Environment**](../../../what-is-glue42-core/core-concepts/environment/index.html).