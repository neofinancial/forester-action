import aws from 'aws-sdk';

const getPresignedPost = async (fileName: string): Promise<aws.S3.PresignedPost> => {
  const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME, REGION } = process.env;

  if (ACCESS_KEY && SECRET_KEY && BUCKET_NAME && REGION) {
    console.log('received secrets');
  }

  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4',
  });

  try {
    const s3 = new aws.S3();

    const presignedPost = await s3.createPresignedPost({
      Bucket: process.env.BUCKET_NAME,
      Fields: {
        key: fileName,
      },
      Expires: 120,
    });

    return presignedPost;
  } catch (error) {
    throw new Error(`Could not retrieve file from S3: ${JSON.stringify(error)}`);
  }
};

export { getPresignedPost };
