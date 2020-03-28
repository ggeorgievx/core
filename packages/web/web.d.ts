import { UnsubscribeFunction } from "callback-registry";
import { Glue42Core } from "@glue42/core";
import { Glue42 } from "@glue42/desktop";

/**
 * Factory function that creates a new Glue42Web API.
 * If your application is running in Glue42 Enterprise this will return a Glue42.Glue API, which is a super-set of the Glue42Web API.
 */
type GlueWebFactory = (config?: Glue42Web.Config) => Promise<Glue42Web.API | Glue42.Glue>;

export default GlueWebFactory;

// tslint:disable-next-line:no-namespace
export namespace Glue42Web {

    export import Interop = Glue42Core.Interop;
    export import Contexts = Glue42Core.Contexts;
    export import Logger = Glue42Core.Logger;

    export interface Config {
        /**
         * By default @glue42/web will try to connect to a shared worker located in "/shared/worker.js". Use this ot override the shared worker location.
         * @default "/glue/worker.js"
         */
        worker?: string;

        /**
         * Change the log level of the internal logger
         * @ignore
         * @default error
         */
        logger?: Glue42Core.LogLevel;

        /**
         * Options around layout save/restore
         */
        layouts?: {
            /**
             * If true the set of windows opened by the application will be saved (in local storage) when the window is closed and restored
             * when the window is started again. The data saved about each window includes URL, bounds and custom window context.
             * It will also save and restore the window context of the current window.
             * @default false
             */
            autoRestore?: boolean;

            /**
             * If set will return glue.windows.my().context automatically when asked for layout state
             * @default false
             */
            autoSaveWindowContext?: boolean;
        };

        /**
         * Use this to fetch a configuration file from some URL. The user passed object will extend
         * If false will not try to fetch and proceed with local config only
         */
        extends?: string | false;
    }

    export interface API extends Glue42Core.GlueCore {
        windows: Glue42Web.Windows.API;
        layouts: Glue42Web.Layouts.API;
        notifications: Glue42Web.Notifications.API;
    }

    /**
     * @docmenuorder 4
     * @intro
     */
    export namespace Windows {
        export interface Bounds {
            top: number;
            left: number;
            width: number;
            height: number;
        }

        export interface WebWindow {
            id: string;

            name: string;

            getURL(): Promise<string>;

            moveResize(dimension: Partial<Bounds>): Promise<WebWindow>;

            resizeTo(width?: number, height?: number): Promise<WebWindow>;

            moveTo(top?: number, left?: number): Promise<WebWindow>;

            close(): Promise<WebWindow>;

            getTitle(): Promise<string>;

            setTitle(title: string): Promise<WebWindow>;

            getBounds(): Promise<Bounds>;

            getContext(): Promise<any>;

            updateContext(context: any): Promise<WebWindow>;

            setContext(context: any): Promise<WebWindow>;

            onContextUpdated(callback: (context: any, window: WebWindow) => void): UnsubscribeFunction;
        }

        export interface CreateOptions {
            /** Required. The URL of the app to be loaded in the new window */
            url?: string;

            /**
             * Distance of the top left window corner from the top edge of the screen.
             * @default 0
             */
            top?: number;

            /**
             * Distance of the top left window corner from the left edge of the screen.
             * @default 0
             */
            left?: number;

            /**
             * Window width.
             * @default 400
             */
            width?: number;

            /**
             * Window height.
             * @default 400
             */
            height?: number;

            /**
             * The initial window context. Accessible from {@link WebWindow#getContext}
             */
            context?: any;

            /**
             * The ID of the window that will be used to relatively position the new window.
             * Can be combined with `relativeDirection`.
             */
            relativeTo?: string;

            /**
             * Direction (`"bottom"`, `"top"`, `"left"`, `"right"`) of positioning the window relatively to the `relativeTo` window. Considered only if `relativeTo` is supplied.
             * @default "right"
             */
            relativeDirection?: RelativeDirection;
        }

        export type RelativeDirection = "top" | "left" | "right" | "bottom";

        export interface API {
            list(): WebWindow[];

            /** Returns the current window. */
            my(): WebWindow;

            /**
             * Finds a window by ID.
             * @param id Window ID.
             */
            findById(id: string): WebWindow | undefined;

            /**
             * Opens a new Glue42 Window.
             * @param url The window URL.
             * @param options Options for creating a window.
             */
            open(name: string, url: string, options?: CreateOptions): Promise<WebWindow>;

            /**
             * Notifies when a new window is opened.
             * @param callback Callback function to handle the event. Receives the added window as a parameter. Returns an unsubscribe function.
             */
            onWindowAdded(callback: (window: WebWindow) => void): UnsubscribeFunction;

            /**
             * Notifies when a window is closed. For backwards compatibility, you can also use `windowRemoved`.
             * @param callback Callback function to handle the event. Receives the removed window as a parameter. Returns an unsubscribe function.
             */
            onWindowRemoved(callback: (window: WebWindow) => void): UnsubscribeFunction;
        }
    }

    /**
     * @docmenuorder 6
     * @intro
     * **Layouts** allows you to save the arrangement of any set of applications running in Glue42 Desktop and later restore it. The **Layouts** API can be accessed using `glue.layouts`.
     *
     * The **Layouts** library supports different types of layouts:
     *
     * - [Global layouts](../../../../glue42-concepts/windows/layouts/javascript/index.html#global_layouts)
     * - [Activity layouts](../../../../glue42-concepts/windows/layouts/javascript/index.html#activity_layouts)
     *
     * See also the [**Layouts**](../../../../glue42-concepts/windows/layouts/javascript/index.html) documentation for more details.
     */
    namespace Layouts {

        /**
         * Supported layout types are Global and Activity.
         * Global Layout saves all running applications and their state. By default, ignores hidden windows.
         * Activity Layout saves applications running in an activity, the activity state and the individual windows states.
         * By default, saves the activity of the current application but can be configured to save any activity.
         * Activity layouts can be restored as new activity instances or joined to any running activity.
         *
         * @docmenuorder 11
         *
         */
        export type LayoutType = "Global" | "Workspace";

        /**
         * Controls the import behavior. If `replace` (default), all existing layouts will be removed.
         * If `merge`, the layouts will be added to the existing ones.
         *
         * @docmenuorder 12
         *
         */
        export type ImportMode = "replace" | "merge";

        /**
         * Layouts API.
         *
         * @docmenuorder 1
         */
        export interface API {
            /** Lists all available layouts. */
            list(): Layout[];

            /**
             * Saves a new layout.
             * @param layout Options for saving a layout.
             */
            save(layout: NewLayoutOptions): Promise<Layout>;

            /**
             * Restores a layout.
             * @param options Options for restoring a layout.
             */
            restore(options: RestoreOptions): Promise<void>;

            /**
             * Removes a layout
             * @param type Type of the layout to remove.
             * @param name Name of the layout to remove.
             */
            remove(type: string, name: string): Promise<void>;

            /**
             * Subscribes for layout save requests - your application has the option to save data (context) when a layout is saved.
             * @param callback The callback passed as an argument will be invoked when a layout save is requested.
             * @returns unsubscribe function.
             */
            onSaveRequested(callback: (context?: object) => SaveRequestResponse): UnsubscribeFunction;
        }

        /**
         * Describes a layout and its state.
         *
         * @docmenuorder 2
         *
         */
        export interface Layout {
            /** Name of the layout. The name is unique per layout type. */
            name: string;

            /** Type of the layout. */
            type: LayoutType;

            /** Array of component objects describing the applications that are saved in the layout. */
            components: LayoutComponentInfo[];

            /** Context object passed when the layout was saved. */
            context: any;

            /** Metadata passed when the layout was saved. */
            metadata: any;
        }

        export interface LayoutComponentInfo {
            type: "window";
            name: any;
            windowContext: any;
            url: string;
            bounds: any;
            id: string;
            main: boolean;
        }

        /**
         * Object describing the layout that you want to save.
         */
        export interface NewLayoutOptions {
            /** Name of the layout. */
            name: string;

            /**
             * Context (application specific data) to be saved with the layout.
             * Used to transfer data to the applications when restoring a layout.
             */
            context?: any;

            /**
             * Metadata to be saved with the layout.
             */
            metadata?: any;
        }

        /**
         * Options object for restoring layouts.
         */
        export interface RestoreOptions {

            /**
             * Name of the layout to restore.
             */
            name: string;

            /**
             * If `true`, will close all visible running instances before restoring the layout.
             * Exceptions are the current application and the Application Manager application.
             * The default is `true` for `Global` layouts and `false` for `Activity` layouts.
             */
            closeRunningInstance?: boolean;

            /**
             * Context object that will be passed to the restored apps. It will be merged with the saved context object.
             */
            context?: object;
        }

        /**
         * Object returned as a result to a save layout request.
         */
        export interface SaveRequestResponse {

            /** Context object specific to the application. */
            windowContext: object;
        }
    }

    /**
     * @docmenuorder 5
     * @intro
     */
    export namespace Notifications {
        export interface API {
            /**
             * Raises a new notification
             * @param notification notification options
             */
            raise(notification: Glue42NotificationOptions): Promise<Notification>;
        }

        export interface Glue42NotificationOptions extends NotificationOptions {
            /** the title of the notification */
            title: string;
            /** set to make the notification click invoke an interop method with specific arguments */
            clickInterop?: InteropActionSettings;
        }

        export interface Glue42NotificationAction extends NotificationAction {
            /** set to make the action invoke an interop method with specific arguments */
            interop: InteropActionSettings;
        }

        export interface InteropActionSettings {
            method: string;
            arguments?: any;
            target?: "all" | "best";
        }
    }
}
