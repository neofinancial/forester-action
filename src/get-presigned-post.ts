import { getInput, setFailed } from '@actions/core';
import aws from 'aws-sdk';
import { inspect } from 'util';

const getPresignedPost = async (fileName: string): Promise<string> => {
  const accessKeyId = getInput('accessKeyId');
  const secretAccessKey = getInput('secretAccessKey');
  const region = getInput('region');
  const bucket = getInput('bucket');

  aws.config.update({
    accessKeyId,
    secretAccessKey,
    region,
    signatureVersion: 'v4',
  });

  try {
    const s3 = new aws.S3();

    const presignedPost = await s3.getSignedUrl('putObject', {
      Bucket: bucket,
      Key: fileName,
      Expires: 120,
    });

    return presignedPost;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not retrieve file from S3');
  }
};

export { getPresignedPost };
