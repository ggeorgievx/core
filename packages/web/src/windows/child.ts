import { RemoteWebWindow } from "./remote";
import { Control } from "../control/control";
import { Windows } from "./main";

/**
 * A Glue42 enabled browser window created by our application
 * Implements Glue42Web.Windows.WebWindow by calling interop methods of the remote window
 */
export class ChildWebWindow extends RemoteWebWindow {
    constructor(public window: Window, public id: string, public name: string, control: Control, windows: Windows) {
        super(id, name, control, windows);
    }
}
