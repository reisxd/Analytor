import Express from "express";
import db from "./MongoClient.js";
import Route from "./routes/index.js";
import session from "express-session";
import passport from "passport";
import localPassport from "passport-local";
import bcrpyt from "bcrypt";

const app = Express();
const expressSession = session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localPassport(async (username, password, cb) => {
    let user = await db.collection("users").findOne({ username });
    if (!user) return cb(null, false);
    if (await bcrpyt.compare(password, user.password))
      return cb(null, {
        username: user.username,
        email: user.email,
        id: user.id,
      });
    return cb(null, false);
  })
);

passport.serializeUser(function (user, cb) {
  return cb(null, { username: user.username, email: user.email, id: user.id });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      username: user.username,
      email: user.email,
      id: user.id,
    });
  });
});

app.use("/", Route);
app.set("db", db);

app.listen(80);
