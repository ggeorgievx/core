describe("properties: ", () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };
    const threeContainersConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: [

                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    windowConfig
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [

                        ]
                    }
                ]
            }
        ]
    };
    let workspace;

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    describe("id: ", () => {
        it(`Should not be undefined`, async () => {
            const window = workspace.getAllWindows()[0];
            await window.forceLoad();
            expect(window.id).to.not.be.undefined;
            expect(window.id.length).to.not.eql(0);
        });
    });

    describe("frameId: ", () => {
        it(`Should be correct`, async () => {
            const currFrame = (await glue.workspaces.getAllFrames())[0];
            const window = workspace.getAllWindows()[0];

            expect(window.frameId).to.eql(currFrame.id);
        });

        it(`Should not be undefined`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.frameId).to.not.be.undefined;
            expect(window.frameId.length).to.not.eql(0);
        });
    });

    describe("workspaceId: ", () => {
        it(`Should be correct`, async () => {
            const window = workspace.getAllWindows()[0];

            expect(window.workspaceId).to.eql(workspace.id);
        });

        it(`Should not be undefined`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.workspaceId).to.not.be.undefined;
            expect(window.workspaceId).to.not.eql(0);
        });
    });

    describe("title: ", () => {
        const layoutName = "unique.layout.name";
        const windowTitle = "unique.window.name";
        const configWithTitle = {
            name: layoutName,
            type: "Workspace",
            metadata: {},
            components: [{
                type: "Workspace",
                state: {
                    children: [{
                        type: "column",
                        children: [{
                            type: "row",
                            children: [{
                                type: "group",
                                children: [{
                                    type: "window",
                                    config: {
                                        appName: "dummyApp",
                                        title: windowTitle
                                    }
                                }],
                                "config": {}
                            }],
                            "config": {}
                        }],
                        "config": {}
                    }],
                    "config": {
                        "name": layoutName,
                        "title": "Untitled 1"
                    },
                    "context": {}
                }
            }]
        }

        after(() => {
            return glue.workspaces.layouts.delete(layoutName);
        })

        it("be the same as the one specified in the config when a layout is restored", async () => {
            await glue.workspaces.layouts.import([configWithTitle]);
            const newWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            const allWindows = newWorkspace.getAllWindows();

            expect(allWindows[0].title).to.eqls(windowTitle);
        });

        it(`Should not be undefined`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.title).to.not.be.undefined;
            expect(window.title.length).to.not.eql(0);
        });
    });

    describe("type: ", () => {
        it(`Should be window`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.type).to.eql("window");
        });
    });

    describe("positionIndex: ", () => {
        it(`Should be 0 when the window is first`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.positionIndex).to.eql(0);
        });
    });

    describe("isMaximized: ", () => {
        it(`Should be false when the window is not maximized`, () => {
            const window = workspace.getAllWindows()[0];
            expect(window.isMaximized).to.be.false;
        });
    });

    describe("isLoaded: ", () => {
        it(`Should be true when the window is loaded`, async () => {
            const window = workspace.getAllWindows()[0];
            await window.forceLoad();

            expect(window.isLoaded).to.be.true;
        });
    });

    describe("focused: ", () => {
        it(`Should be boolean`, () => {
            const window = workspace.getAllWindows()[0];

            expect(typeof window.focused).to.eql("boolean");
        });
    });

    describe("appName: ", () => {
        it(`Should be correct`, () => {
            const window = workspace.getAllWindows()[0];

            expect(window.appName).to.eql("dummyApp");
        });

        it(`Should not be empty or undefined`, () => {
            const window = workspace.getAllWindows()[0];

            expect(window.appName).to.not.be.undefined;
            expect(window.appName.length).to.not.eql(0);
        });
    });

    describe("workspace: Should", () => {
        it("be correct for all windows in a workspace", async () => {
            workspace = await glue.workspaces.createWorkspace(threeContainersConfig);

            const allWindows = workspace.getAllWindows();

            allWindows.forEach((w) => {
                expect(w.workspace.id).to.eql(workspace.id);
            });
        });

        it("be correct when a window has just been added in a workspace", async () => {
            workspace = await glue.workspaces.createWorkspace(threeContainersConfig);

            const win = await workspace.addWindow({ type: "window", appName: "dummyApp" });

            expect(win.workspace.id).to.eql(workspace.id);
        });
    });

    describe("frame: Should", () => {
        const newFrameConfig = Object.assign(threeContainersConfig, { frame: { newFrame: true } });
        it("be correct for all windows", async () => {
            workspace = await glue.workspaces.createWorkspace(threeContainersConfig);

            const allWindows = workspace.getAllWindows();

            allWindows.forEach((w) => {
                expect(w.frame.id).to.eql(workspace.frame.id);
            });
        });

        it("be correct when a window has just been added", async () => {
            workspace = await glue.workspaces.createWorkspace(threeContainersConfig);

            const win = await workspace.addWindow({ type: "window", appName: "dummyApp" });

            expect(win.frame.id).to.eql(workspace.frame.id);
        });
    });

    describe("parent: Should", () => {
        it("be correct", async () => {
            const allGroups = workspace.getAllGroups();
            const firstGroup = allGroups[0];
            const groupChildren = firstGroup.children;

            groupChildren.forEach((c) => {
                expect(c.parent.id).to.eql(firstGroup.id);
            });
        });

        it("be correct when a window has just been added", async () => {
            const allGroups = workspace.getAllGroups();
            const firstGroup = allGroups[0];
            const win = await firstGroup.addWindow({ type: "window", appName: "dummyApp" });

            expect(win.parent.id).to.eql(firstGroup.id);
        });
    });
});
