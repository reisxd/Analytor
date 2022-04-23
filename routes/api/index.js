import Express from 'express';
import analyticsRoute from './analytics/index.js';
import errorHandlerRoute from './errorHandler/index.js';
import sitesRoute from './sites/index.js';

const route = Express.Router();
route.use('/analytics', analyticsRoute);
route.use('/errorHandler', errorHandlerRoute);
route.use('/sites', sitesRoute);

export default route;