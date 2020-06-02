/* eslint-disable no-undef */
const APP_NAME = "Application A";

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window
  .startApp({ appName: APP_NAME })
  .then(() => {
    return glue.channels.all();
  })
  .then(channelNames => {
    let myChannel = glue.channels.my();
    async function onJoinClicked(channelName) {
      myChannel = channelName;
      try {
        await glue.channels.join(myChannel);
      } catch (error) {
        console.error(`Failed to join channel "${myChannel}". Error: `, error);
        logger.error(
          error.message || `Failed to join channel "${channelName}".`
        );
      }

      renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);
    }
    async function onLeaveClicked() {
      if (myChannel) {
        try {
          await glue.channels.leave();
        } catch (error) {
          console.error(
            `Failed to leave channel "${myChannel}". Error: `,
            error
          );
          logger.error(
            error.message || `Failed to leave channel "${myChannel}".`
          );
        }
      }
      myChannel = undefined;
      renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);
    }

    renderChannels(channelNames, myChannel, onJoinClicked, onLeaveClicked);

    let subscribed = false;
    let unsubscribeFunc;

    const subscribeUnsubscribeButtonElement = document.getElementById(
      "subscribeUnsubscribeButton"
    );
    const SUBSCRIBE_BUTTON_TEXTCONTENT = "Subscribe for current channel";
    subscribeUnsubscribeButtonElement.textContent = SUBSCRIBE_BUTTON_TEXTCONTENT;
    subscribeUnsubscribeButtonElement.onclick = async () => {
      subscribed = !subscribed;
      if (subscribed) {
        try {
          const subscribeCallback = (data, context, updaterId) => {
            logger.info(
              `Received data:
              ${JSON.stringify(data)}
              , context:
              ${JSON.stringify(context)}
              , that was published by ${updaterId} on the current channel (${myChannel}).`
            );
          };
          unsubscribeFunc = await glue.channels.subscribe(subscribeCallback);
        } catch (error) {
          console.error(
            `Failed to subscribe for current channel "${myChannel}". Error: `,
            error
          );
          logger.error(
            error.message ||
              `Failed to subscribe for current channel "${myChannel}".`
          );
        }
        subscribeUnsubscribeButtonElement.textContent = "Unsubscribe";
      } else {
        unsubscribeFunc();
        subscribeUnsubscribeButtonElement.textContent = SUBSCRIBE_BUTTON_TEXTCONTENT;
      }
    };
  })
  .then(clearLogsHandler)
  .catch(console.error);
