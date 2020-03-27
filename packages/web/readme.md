# Intro

@glue42/web is the core [Glue42](https://glue42.com/) JavaScript module, used in applications that want to share data with other glue enabled applications. It can be used by applications hosted in Glue42, browser or Node.js.

For more advanced scenarios that require usage of window or application management, activities, layouts, channels or hotkeys use [@glue42/desktop](https://www.npmjs.com/package/@glue42/desktop) package, which is a super set of @glue42/core.

@glue42/core includes the following modules:

* **interop** - enables applications to:
    * offer functionality to other applications (JavaScript and native) by registering Interop methods
    * discover applications which offer methods
    * invoke (call) methods on the user’s desktop and across the network
    * stream and subscribe to real-time data using the Streaming API.
* **contexts** - share named data objects between applications
* **metrics** - a way of assessing the life cycle of a certain process (application performance, business process, employee productivity etc.) by acquiring, recording and monitoring over time specific data about the key performance indicators of the said process.
* **bus** - basic pub/sub API that allow apps to publish/subscribe for messages on a specific topic
