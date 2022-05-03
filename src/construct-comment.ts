const constructComment = async (commentData?: string): Promise<string> => {
  return `
## Dependanot Report
Data: ${commentData || 'N/A'}
<!-- dependanot-action-comment -->
`;
};

export { constructComment };
