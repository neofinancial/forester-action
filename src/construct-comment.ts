const constructComment = async (commentData?: any): Promise<string> => {
  return `
## Dependanot Report
${commentData || 'n/a'}
<!-- dependanot-action-comment -->
`;
};

export { constructComment };
