import Express from 'express';
import cors from 'cors';
import UAParser from 'ua-parser-js';
const route = Express.Router();

route.post('/', cors(), async (req, res) => {
    const token = req.body.token;
    const site = await req.app.get('db').collection('sites').findOne({ token });
    if (!site) return res.status(404).json({ error: 'Site not found.' });
    if (!req.headers['user-agent']) return res.status(400).json({ error: 'No user-agent header.' });
console.log(site);
    const siteUrl = req.body.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img);
    console.log (siteUrl, site.url);
    if (siteUrl[0] !== site.url) return res.status(400).json({ error: 'Invalid site url.' });
    const url_ = new URL(req.body.url);
    const endpoint = url_.pathname;
    const ua = new UAParser(req.headers['user-agent']);
    const data = ua.getResult();

    // Handle OSes that got used.
    const osData = await req.app.get('db').collection('oses').findOne({ token });
    if (!osData) {
        await req.app.get('db').collection('oses').insertOne({
            token,
            oses: [
                {
                    name: data.os.name,
                    version: data.os.version,
                    usageCount: 1
                }
            ]
        });
    } else {
        const os = osData.oses.find(os => os.name === data.os.name);
        if (os && os.version === data.os.version) {
            await req.app.get('db').collection('oses').updateOne({ token }, {
                $set: {
                    oses: osData.oses.map(os => {
                        if (os.name === data.os.name) {
                            if (os.version === data.os.version) {
                            os.usageCount++;
                            }
                        }
                        return os;
                    })
                }
            });
        } else {
            await req.app.get('db').collection('oses').updateOne({ token }, {
                $push: {
                    oses: {
                        name: data.os.name,
                        version: data.os.version,
                        usageCount: 1
                    }
                }
            });
        }
    }

    // Handle browsers that got used.
    const browserData = await req.app.get('db').collection('browsers').findOne({ token });
    if (!browserData) {
        await req.app.get('db').collection('browsers').insertOne({
            token,
            browsers: [
                {
                    name: data.browser.name,
                    version: data.browser.version,
                    usageCount: 1
                }
            ]
        });
    } else {
        const browser = browserData.browsers.find(browser => browser.name === data.browser.name);
        if (browser && browser.version === data.browser.version) {
            await req.app.get('db').collection('browsers').updateOne({ token }, {
                $set: {
                    browsers: browserData.browsers.map(browser => {
                        if (browser.name === data.browser.name) {
                            if (browser.version === data.browser.version) {
                                browser.usageCount++;
                            }
                        }
                        return browser;
                    })
                }
            });
        } else {
            await req.app.get('db').collection('browsers').updateOne({ token }, {
                $push: {
                    browsers: {
                        name: data.browser.name,
                        version: data.browser.version,
                        usageCount: 1
                    }
                }
            });
        }
    }

    // Handle endpoint analytics here.
    const analytics = await req.app.get('db').collection('analytics').findOne({ token, endpoint });
    if (!analytics) await req.app.get('db').collection('analytics').insertOne({ token, endpoint, visits: 1 });
    else req.app.get('db').collection('analytics').updateOne({ token, endpoint }, { $inc: { visits: 1 } });
    res.status(204).end();
});
export default route;