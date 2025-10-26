"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDatabase = void 0;
class ClientDatabase {
    constructor(_source) {
        this.feedbacknumber = (data) => {
            this.feedback("feedback_number", data);
        };
        this.feedbackboolean = (data) => {
            this.feedback("feedback_boolean", data);
        };
        this.feedbackstring = (data) => {
            this.feedback("feedback_string", data);
        };
        this.feedbackobject = (data) => {
            this.feedback("feedback_object", data);
        };
        this.feedbacklist = (data) => {
            this.feedback("feedback_list", data);
        };
        this.feedbackselect = (data) => {
            this.feedback("feedback_select", data);
        };
        this.feedback = (title, data) => {
            if (this.source == undefined)
                return;
            const p = {
                name: title,
                data: data
            };
            this.source.send(JSON.stringify(p, null, 2));
        };
        this.source = _source;
    }
}
exports.ClientDatabase = ClientDatabase;
