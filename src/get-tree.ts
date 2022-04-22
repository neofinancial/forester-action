import { Arborist } from '@npmcli/arborist';

const getTree = async (): Promise<any> => {
  const arborist = new Arborist({
    prefix: process.cwd(),
    path: process.cwd(),
  });
  const tree = await arborist.loadVirtual({ path: process.cwd(), name: 'npm' });

  return tree;
};

export { getTree };
