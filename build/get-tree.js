"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTree = void 0;
const arborist_1 = require("@npmcli/arborist");
const getTree = async () => {
    const arborist = new arborist_1.Arborist({
        prefix: process.cwd(),
        path: process.cwd(),
    });
    const tree = await arborist.loadVirtual({ path: process.cwd(), name: 'npm' });
    return tree;
};
exports.getTree = getTree;
