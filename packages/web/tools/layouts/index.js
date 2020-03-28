// g0
const initialAutoSave = typeof localStorage.saveOnClose !== "undefined" ? localStorage.saveOnClose : true;
const initialAutoRestore = typeof localStorage.restoreOnStart !== "undefined" ? localStorage.restoreOnStart : true;

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("saveOnClose").checked = Boolean(initialAutoSave);
    document.getElementById("restoreOnStart").checked = Boolean(initialAutoRestore);
})


GlueWeb({
    layouts: {
        autoSaveOnClose: initialAutoSave,
        autoRestoreOnStartup: initialAutoRestore,
        autoSaveWindowContext: true
    }
}).then((glue) => {
    window.glue = glue;
    // we autoSave our context (because of autoSaveWindowContext setting) - now restore it
    const savedColor = glue.windows.my().context.color;
    if (savedColor) {
        changeBackground(savedColor);
    }

    // refresh the list with child windows every second (TODO - this should be event driven)
    setInterval(() => refreshChildWindows(), 1000);
    refreshLayouts();
});


async function openNew() {
    let relativeTo = glue.windows.my().id;
    const childWindows = glue.windows.getChildWindows();
    if (childWindows.length > 0){
        relativeTo = childWindows[childWindows.length - 1].id;
    }

    glue.windows.open("child", "./child.html", { relativeTo });
    refreshChildWindows();

}

function update() {
    localStorage.saveOnClose = document.getElementById("saveOnClose").checked;
    localStorage.restoreOnStart = document.getElementById("restoreOnStart").checked;
}

function refreshChildWindows() {
    const childWindows = glue.windows.getChildWindows();
    console.log(childWindows);

    var list = document.getElementById('child-windows');
    list.innerHTML = '';
    for (const childWindow of childWindows) {
        var entry = document.createElement('li');
        entry.appendChild(document.createTextNode(`${childWindow.id}`));
        list.appendChild(entry);
    }
}

function refreshLayouts() {
    const layouts = glue.layouts.list();

    var list = document.getElementById('layouts');
    list.innerHTML = '';
    for (const layout of layouts) {
        var entry = document.createElement('li');
        let contexts = layout.components.map(c => `<br\> <p\>             ${c.url} => b: ${JSON.stringify(c)}`).join(",");
        const text = `${layout.name} - (${layout.components.length} windows) ${contexts}`;
        const node = document.createElement("div");
        node.innerHTML = text;
        entry.appendChild(node);
        list.appendChild(entry);
    }
}

function onChangeBackgroundClick() {
    const color = getRandomColor();
    changeBackground(color);
    glue.windows.my().setContext({ color });
}

function changeBackground(color) {
    const body = document.getElementsByTagName("body")[0];
    body.style = `background-color:${color};`;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
