import AWS from 'aws-sdk';

export const uploadToS3 = async (file: File) => {
	try {
		AWS.config.update({
			accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
		});
		const s3 = new AWS.S3({
			params: {
				Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
			},
			region: 'us-east-2',
		});
		const file_key =
			'uploads/' + Date.now().toString() + file.name.replaceAll(' ', '-');
		const params = {
			Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
			Key: file_key,
			Body: file,
		};
		const upload = s3
			.putObject(params)
			.on('httpUploadProgress', (event) => {
				console.log(
					'Uploading to s3...',
					parseInt(((event.loaded * 100) / event.total).toString(), 10) + '%'
				);
			})
			.promise();

		await upload.then((data) => {
			console.log('successfully uploaded to s3!', file_key);
		});

		return {
			file_key,
			file_name: file.name,
		};
	} catch (error) {
		console.error('Failed to upload to s3', error);
	}
};

export const getS3Url = (file_key: string) =>
	`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`;
