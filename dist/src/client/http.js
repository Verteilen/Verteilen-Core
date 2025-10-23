"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientHTTP = void 0;
class ClientHTTP {
    constructor(_url, _method, _params) {
        this.RUN = () => {
            fetch(this.url, {
                method: this.method,
                body: this.params
            }).then(x => {
                x.text().then(y => {
                    const h = {
                        name: "result",
                        data: {
                            status: x.status,
                            statusText: x.statusText,
                            headers: x.headers,
                            ok: x.ok,
                            data: y
                        }
                    };
                    console.log(JSON.stringify(h));
                });
            }).catch((reason) => {
                const h = {
                    name: "error",
                    data: reason
                };
                console.log(JSON.stringify(h));
            });
        };
        this.url = _url;
        this.method = _method;
        this.params = _params;
    }
}
exports.ClientHTTP = ClientHTTP;
