"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructComment = void 0;
const constructComment = async (commentData) => {
    return `
## Dependanot Report
Data: ${commentData || 'N/A'}
<!-- dependanot-action-comment -->
`;
};
exports.constructComment = constructComment;
