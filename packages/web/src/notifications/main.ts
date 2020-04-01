import { Glue42Web } from "../../web";

export class Notifications implements Glue42Web.Notifications.API {
    constructor(private interop: Glue42Web.Interop.API) {
    }

    public async raise(options: Glue42Web.Notifications.Glue42NotificationOptions): Promise<Notification> {

        if (!("Notification" in window)) {
            throw new Error("this browser does not support desktop notification");
        }
        let permissionPromise: Promise<NotificationPermission>;
        if (Notification.permission === "granted") {
            permissionPromise = Promise.resolve("granted");
        } else if (Notification.permission === "denied") {
            permissionPromise = Promise.reject("no permissions from user");
        } else {
            permissionPromise = Notification.requestPermission();
        }

        await permissionPromise;

        const notification = this.raiseUsingWebApi(options);

        if (options.clickInterop) {
            const interopOptions = options.clickInterop;
            notification.onclick = (): void => {
                this.interop.invoke(interopOptions.method, interopOptions?.arguments ?? {}, interopOptions?.target ?? "best");
            };
        }

        return notification;
    }

    private raiseUsingWebApi(options: Glue42Web.Notifications.Glue42NotificationOptions): Notification {
        return new Notification(options.title, options);
    }
}
