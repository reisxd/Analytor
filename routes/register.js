import Express from 'express';
import bcrypt from 'bcrypt';
import { Snowflake } from 'nodejs-snowflake';
const route = Express.Router();

route.post('/', async (req, res) => {
    let { username, email, password } = req.body;
    let user = await req.app.get('db').collection('users').findOne({ username });
    if (user) return res.status(403).json({ error: 'Username taken.' });
    user = await req.app.get('db').collection('users').findOne({ email });
    if (user) return res.status(403).json({ error: 'Email taken.' });
    let passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const userId = new Snowflake();
    await req.app.get('db').collection('users').insertOne({ username, email, password: passwordHash, id: userId.getUniqueID().toString() });
    return res.status(204).redirect('/login');
});

export default route;