import { compareInstance, waitFor, getMethodName } from "./helpers";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { expect } from "chai";
import { waitForArr } from "../helpers";
import { PromiseWrapper } from "../../src/utils/pw";

/**
 * Verifies that agm receives events about other servers actions
 */
describe("events from other", () => {
    let glue!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
    });

    afterEach(() => {
        doneAllGlues();
    });

    it("when a server registers a method methodAdded and serverMethodAdded events are received", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;
            glue2.agm.register(name, () => {
                // DO NOTHING
            });
        });

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodAdded((addition) => {

            const server = addition.server || {};
            const method = addition.method;
            if (glue2 && compareInstance(glue2.agm.instance, server) && method?.name === name) {
                callDone();
            }
        });
    });

    it("when a server un-registers a method methodRemoved and serverMethodRemoved events are received", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;
            glue2.agm.register(name, () => {
                // DO NOTHING
            });
        });

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                glue2.agm.unregister(name);
            }
        });

        glue.agm.methodRemoved((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodRemoved((removal) => {
            const server = removal.server || {};
            const method = removal.method;

            if (compareInstance(server, glue2.agm.instance) && method?.name === name) {
                callDone();
            }
        });
    });

    it("when a server registers a stream I received method added event", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;
            glue2.agm.createStream(name, {}, () => {
                // DO NOTHING
            });
        });

        glue.agm.methodAdded((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodAdded((addition) => {

            const server = addition.server || {};
            const method = addition.method;

            if (glue2 && compareInstance(glue2.agm.instance, server) && method?.name === name) {
                callDone();
            }
        });
    });

    it("when a server un-registers a stream I received method removed event", (done) => {
        const name = getMethodName();
        const callDone = waitFor(2, done);

        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;
            glue2.agm.createStream(name).then((s) => {
                s.close();
            });
        });

        glue.agm.methodRemoved((m) => {
            if (m.name === name) {
                callDone();
            }
        });

        glue.agm.serverMethodRemoved((removal) => {
            const server = removal.server || {};
            const method = removal.method;

            if (compareInstance(server, glue2.agm.instance) && method?.name === name) {
                callDone();
            }
        });
    });

    it("when a server is started serverAdded event is received", (done) => {
        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;

            glue.agm.serverAdded((server) => {
                if (compareInstance(server, glue2.agm.instance)) {
                    done();
                }
            });
        });
    });

    it("when a server is stopped serverRemoved event is received", (done) => {
        let glue2: Glue42Core.GlueCore;
        createGlue().then((g2) => {
            glue2 = g2;
            glue.agm.serverAdded((server) => {
                if (compareInstance(server, glue2.agm.instance)) {
                    glue2.connection.logout();
                }
            });
        });

        glue.agm.serverRemoved((server) => {
            if (compareInstance(server, glue2.agm.instance)) {
                done();
            }
        });
    });

    it("should call serverMethodAdded with the correct Instance", (done) => {
        const newName = getMethodName();
        const newMethodDefinition = {
            name: newName,
        };
        const uns = glue.agm.serverMethodAdded((info) => {
            if (info.server.instance === glue.agm.instance.instance &&
                info.method.name === newName) {
                uns();
                expect(info.server.environment, "env").to.eql(glue.agm.instance.environment);
                expect(info.server.machine, "machine").to.eql(glue.agm.instance.machine);
                expect(info.server.user, "user").to.eql(glue.agm.instance.user);
                done();
            }
        });
        glue.agm.register(newMethodDefinition, () => {
            // DO NOTHING
        });
    });

    it("methodAdded should contain the instance of the application that executed the method", (done) => {
        const newName = getMethodName();

        glue.agm.methodAdded((m) => {
            if (m.name === newName) {
                glue.agm.invoke(newName, {
                    test: 42
                }, "all").then((invokeRes) => {
                    try {
                        expect(invokeRes.executed_by).to.eql(glue.agm.instance);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }
        });

        glue.agm.register({
            name: newName
        }, () => {
            return {
                test: 24
            };
        });
    });

    it("method added is called for each method registered by other servers", async () => {
        const a = waitForArr(["2", "3", "4"]);
        glue.interop.methodAdded((m) => {
            a.fn(m.name);
        });

        createGlue().then((g2) => {
            g2.interop.register("2", () => { /** DO NOTHING */ });
        });
        createGlue().then(async (g3) => {
            await g3.interop.register("3", () => { /** DO NOTHING */ });

            // and the fourth is registered by us
            glue.interop.register("4", () => { /** DO NOTHING */ });
        });

        return a.promise;
    });

    it("method added should be called if methods differ by accept string only", async () => {
        const a = waitForArr(["2", "2", "2"]);
        glue.interop.methodAdded((m) => {
            if (m.name === "2") {
                a.fn(m.name);
            }
        });

        createGlue().then((g2) => {
            g2.interop.register("2", () => { /** DO NOTHING */ });
        });
        createGlue().then(async (g3) => {
            await g3.interop.register({ name: "2", accepts: "accept" }, () => { /** DO NOTHING */ });

            // and the fourth is registered by us
            glue.interop.register({ name: "2", accepts: "accept", returns: "returns" }, () => { /** DO NOTHING */ });
        });

        return a.promise;
    });
});
