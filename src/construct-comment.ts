const constructComment = async (commentData?: string): Promise<string> => {
  return `
## Forester Report
Data: ${commentData || 'N/A'}
<!-- forester-action-comment -->
`;
};

export { constructComment };
