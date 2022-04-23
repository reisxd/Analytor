import Express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const route = Express.Router();

async function sha256(message) {
    return await crypto.createHash('sha256').update(message).digest('hex');
}
route.post('/', cors(), async (req, res) => {
    const token = req.body.token;
    const site = await req.app.get('db').collection('sites').findOne({ token });
    if (!site) return res.status(404).json({ error: 'Site not found.' });

    const errorBucketId = await sha256(req.body.error.message + req.body.error.source + req.body.error.line + req.body.error.column);
    const errorBucket = await req.app.get('db').collection('errors').findOne({ token });
    if (!errorBucket) {
        await req.app.get('db').collection('errors').insertOne({
            token,
            buckets: [
                {
                    bucketId: errorBucketId,
                    message: req.body.error.message,
                    source: req.body.error.source,
                    line: req.body.error.line,
                    column: req.body.error.column,
                    errorObject: req.body.error.errorObject,
                    count: 1
                }
            ]
        });
    } else {
        const bucket = errorBucket.buckets.find(bucket => bucket.bucketId === errorBucketId);
        if (bucket) {
            await req.app.get('db').collection('errors').updateOne({ token }, {
                $set: {
                    buckets: errorBucket.buckets.map(bucket => {
                        if (bucket.bucketId === errorBucketId) {
                            bucket.count++;
                        }
                        return bucket;
                    })
                }
            });
        } else {
            await req.app.get('db').collection('errors').updateOne({ token }, {
                $push: {
                    buckets: {
                        bucketId: errorBucketId,
                        message: req.body.error.message,
                        source: req.body.error.source,
                        line: req.body.error.line,
                        column: req.body.error.column,
                        errorObject: req.body.error.errorObject,
                        count: 1
                    }
                }
            });
        }
    }

    res.status(204).end();
});
export default route;