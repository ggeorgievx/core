GlueWeb().then((glue) => {
    window.glue = glue;
});

function raise() {
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    glue.notifications.raise({title, body});

}
