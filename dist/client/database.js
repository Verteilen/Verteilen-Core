"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDatabase = void 0;
class ClientDatabase {
    source;
    constructor(_source) {
        this.source = _source;
    }
    feedbacknumber = (data) => {
        this.feedback("feedback_number", data);
    };
    feedbackboolean = (data) => {
        this.feedback("feedback_boolean", data);
    };
    feedbackstring = (data) => {
        this.feedback("feedback_string", data);
    };
    feedbackobject = (data) => {
        this.feedback("feedback_object", data);
    };
    feedbacklist = (data) => {
        this.feedback("feedback_list", data);
    };
    feedbackselect = (data) => {
        this.feedback("feedback_select", data);
    };
    feedback = (title, data) => {
        if (this.source == undefined)
            return;
        const p = {
            name: title,
            data: data
        };
        this.source.send(JSON.stringify(p, null, 2));
    };
}
exports.ClientDatabase = ClientDatabase;
