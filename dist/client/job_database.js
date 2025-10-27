"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientJobDatabase = void 0;
class ClientJobDatabase {
    feedbacknumber = (data) => {
        this.feedback("feedbacknumber", data);
    };
    feedbackboolean = (data) => {
        this.feedback("feedbackboolean", data);
    };
    feedbackstring = (data) => {
        this.feedback("feedbackstring", data);
    };
    feedbackobject = (data) => {
        this.feedback("feedbackobject", data);
    };
    feedbacklist = (data) => {
        this.feedback("feedbacklist", data);
    };
    feedbackselect = (data) => {
        this.feedback("feedbackselect", data);
    };
    feedback = (title, data) => {
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
exports.ClientJobDatabase = ClientJobDatabase;
