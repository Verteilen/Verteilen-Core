"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDatabase = void 0;
/**
 * The database feedback helper\
 * Update the main database container on the cluster server
 */
class ClientDatabase {
    constructor(_source) {
        /**
         * Update database number on the cluster server
         * @param data Target KeyValue
         */
        this.feedbacknumber = (data) => {
            this.feedback("feedback_number", data);
        };
        /**
         * Update database boolean on the cluster server
         * @param data Target KeyValue
         */
        this.feedbackboolean = (data) => {
            this.feedback("feedback_boolean", data);
        };
        /**
         * Update database string on the cluster server
         * @param data Target KeyValue
         */
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
            this.source.emit(title, data);
        };
        this.source = _source;
    }
}
exports.ClientDatabase = ClientDatabase;
//# sourceMappingURL=database.js.map