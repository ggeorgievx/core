// create grid
let api;
function initGrid() {
    const columnDefs = [
        { headerName: "server", field: "server", width: 300 },
        { headerName: "method", field: "method", width: 300 },
        { headerName: "accepts", field: "accepts", width: 100 },
        { headerName: "returns", field: "returns", width: 100 },
        { headerName: "invoke", field: "actions", width: 100, cellRenderer: buttonCellRendererFunc },
    ];

    const gridOptions = {
        columnDefs: columnDefs,
        enableSorting: true,
        enableFilter: true,
        rowHeight: 35
    };

    const eGridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(eGridDiv, gridOptions);
    api = gridOptions.api;
}

// g0
GlueWeb({}).then((glue) => {
    window.glue = glue;
    glue.interop.serverMethodAdded(() => {
        refreshList();
    });
    glue.interop.serverMethodRemoved(() => {
        refreshList();
    });
    initGrid();

    // register an echo method for
    glue.agm.register("echo", (arg) => {
        console.log(arg);
        return arg;
    });
});


async function refreshList() {
    var items = [];
    const servers = glue.interop.servers();
    for (const server of servers) {
        for (const method of server.getMethods()) {
            items.push({
                server: server.instance,
                method: method.name,
                accepts: method.accepts,
                returns: method.returns
            });
        }
    }
    api.setRowData(items);
}

function buttonCellRendererFunc(params) {
    return `<button style="height:30px;vertical:center" onClick="invoke('${params.data.server}', '${params.data.method}')">Invoke</button>`;
}

async function invoke(server, method) {
    const invokeObjStr = prompt("Enter invoke object (uses eval - be careful), leave empty if not needed");
    const invokeObj = eval(`(${invokeObjStr || "{}"})`);
    const result = await glue.interop.invoke(method, invokeObj, {instance: server});
    alert(`response from server ${JSON.stringify(result.returned)}`);
}
