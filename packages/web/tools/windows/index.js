// create grid
let api;
function initGrid() {
    const columnDefs = [
        { headerName: 'id', field: 'id', width: 100 },
        { headerName: 'url', field: 'url', width: 400 },
        { headerName: 'title', field: 'title' },
        { headerName: 'bounds', field: 'bounds' },
        { headerName: 'context', field: 'context' },
        { headerName: "invoke", field: "actions", width: 100, cellRenderer: buttonCellRendererFunc },
    ];

    const gridOptions = {
        columnDefs: columnDefs,
        enableSorting: true,
        enableFilter: true,
        rowHeight: 35
    };

    const eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    api = gridOptions.api;
}

// g0
GlueWeb({}).then((glue) => {
    window.glue = glue;
    glue.windows.onWindowAdded(() => {
        refreshList();
    });
    glue.windows.onWindowRemoved(() => {
        refreshList();
    });
    initGrid();
    setInterval(() => {
        refreshList()
    }, 2000);
});


async function refreshList() {
    var items = [];
    const wins = await glue.windows.list();
    for (var i = 0; i < wins.length; i++) {
        const win = wins[i];
        const id = win.id;
        const context = await win.getContext();
        const url = await win.getURL();
        const bounds = await win.getBounds();
        const title = await win.getTitle();
        items.push({
            id,
            url,
            title,
            bounds: `${bounds.left},${bounds.top} ${bounds.width}x${bounds.height}`,
            context: JSON.stringify(context)
        });
    }
    api.setRowData(items);
}

window.addEventListener('DOMContentLoaded', (event) => {
    var initialUrl = document.location.href;
    if (localStorage.lastUrl) {
        initialUrl = localStorage.lastUrl;
    }

    document.getElementById("url").value = initialUrl;
})

function openNew() {
    const url = document.getElementById("url").value;
    const relative = document.getElementById("relative").checked;
    const options = {};
    if (relative) {
        options.relativeTo = glue.windows.my().id;
    }
    localStorage.lastUrl = url;
    glue.windows.open(url, url, options);
}

function buttonCellRendererFunc(params) {
    return `<button style="height:30px;vertical:center" onClick="closeWindow('${params.data.id}')">Close</button>`;
}

async function closeWindow(windowId) {
    const win = glue.windows.findById(windowId);
    win.close();
}
