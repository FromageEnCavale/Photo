import {S3Client, ListObjectsV2Command, GetObjectCommand} from '@aws-sdk/client-s3';

import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

const client = new S3Client({

    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

    region: 'auto',

    credentials: {

        accessKeyId: process.env.R2_ACCESS_KEY_ID,

        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY

    },

    forcePathStyle: true

});

export default async function handler(req, res) {

    if (req.method !== 'GET') {

        res.setHeader('Allow', ['GET']);

        return res.status(405).end();

    }

    try {

        const data = await client.send(new ListObjectsV2Command({Bucket: process.env.R2_BUCKET}));

        const keys = (data.Contents || []).map(o => o.Key);

        const items = await Promise.all(keys.map(async Key => {

            const url = await getSignedUrl(

                client,

                new GetObjectCommand({Bucket: process.env.R2_BUCKET, Key}),

                {expiresIn: 3600}

            );

            return url;

        }));

        res.setHeader('Content-Type', 'application/json');

        return res.status(200).json(items);

    } catch (err) {

        console.error('R2 error:', err);

        res.setHeader('Content-Type', 'application/json');

        return res.status(500).json({error: err.message});

    }

}