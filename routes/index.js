import Express from 'express';
import authRoute from './authenticate.js';
import registerRoute from './register.js';
import apiRoute from './api/index.js';

const route = Express.Router();

route.use('/authenticate', authRoute);
route.use('/register', registerRoute);
route.use('/api', apiRoute);

export default route;