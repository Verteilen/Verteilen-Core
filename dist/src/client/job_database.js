"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientJobDatabase = void 0;
class ClientJobDatabase {
    constructor() {
        this.feedbacknumber = (data) => {
            this.feedback("feedbacknumber", data);
        };
        this.feedbackboolean = (data) => {
            this.feedback("feedbackboolean", data);
        };
        this.feedbackstring = (data) => {
            this.feedback("feedbackstring", data);
        };
        this.feedbackobject = (data) => {
            this.feedback("feedbackobject", data);
        };
        this.feedbacklist = (data) => {
            this.feedback("feedbacklist", data);
        };
        this.feedbackselect = (data) => {
            this.feedback("feedbackselect", data);
        };
        this.feedback = (title, data) => {
            const p = {
                name: title,
                data: {
                    key: data.key,
                    value: data.value
                }
            };
            console.log(JSON.stringify(p));
        };
    }
}
exports.ClientJobDatabase = ClientJobDatabase;
