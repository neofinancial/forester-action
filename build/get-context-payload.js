"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextPayload = void 0;
const github_1 = require("@actions/github");
const getContextPayload = () => {
    return github_1.context.payload;
};
exports.getContextPayload = getContextPayload;
