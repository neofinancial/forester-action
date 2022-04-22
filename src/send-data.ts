// import aws from 'aws-sdk';

import { PullRequestData } from './get-pull-request-data';

type PostJSON = {
  id: number;
  ref: string;
  baseRef: string;
  hash: string;
  actor: string;
  token: string;
  pullRequest?: number;
};

const sendDataComment = async (url: string, pullRequestData: PullRequestData): Promise<void> => {
  const postJson: PostJSON = {
    id: pullRequestData.repositoryId,
    ref: pullRequestData.ref,
    baseRef: pullRequestData.baseRef,
    hash: pullRequestData.sha,
    actor: pullRequestData.actor,
    token: pullRequestData.token,
  };

  if (pullRequestData.pullRequest) {
    postJson.pullRequest = pullRequestData.pullRequest;
  }

  console.log('send-data', postJson);

  const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME, REGION } = process.env;

  if (ACCESS_KEY && SECRET_KEY && BUCKET_NAME && REGION) {
    console.log('received secrets');
  }

  // aws.config.update({
  //   accessKeyId: process.env.ACCESS_KEY,
  //   secretAccessKey: process.env.SECRET_KEY,
  //   region: process.env.REGION,
  //   signatureVersion: 'v4',
  // });

  // try {
  //   await new aws.S3().createPresignedPost({
  //     Bucket: process.env.BUCKET_NAME,
  //     Fields: {
  //       key: 'foo',
  //     },
  //     Expires: 120,
  //   });
  // } catch (error) {
  //   throw new Error(`Could not retrieve file from S3: ${error.message}`);
  // }
};

export { sendDataComment };
