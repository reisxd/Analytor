import Express from 'express';
import passport from 'passport';
const route = Express.Router();

route.post(
  '/',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

export default route;
