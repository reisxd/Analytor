import Express from "express";
import newRoute from "./new.js";

const route = Express.Router();

route.use("/new", newRoute);

route.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const sites = await req.app
    .get("db")
    .collection("sites")
    .find({ ownedBy: req.user.id })
    .toArray();
  return res.status(200).json(sites);
});

route.get("/:id/telemetry", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ id: req.params.id, ownedBy: req.user.id });
  if (!site) return res.status(404).json({ error: "Site not found." });
  const analytics = await req.app
    .get("db")
    .collection("analytics")
    .find({ token: site.token })
    .toArray();
  return res.status(200).json(analytics);
});

route.get("/:id/analytics/used-oses", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ id: req.params.id, ownedBy: req.user.id });
  if (!site) return res.status(404).json({ error: "Site not found." });
  const oses = await req.app
    .get("db")
    .collection("oses")
    .findOne({ token: site.token });
  return res.status(200).json(oses);
});

route.get("/:id/analytics/used-browsers", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ id: req.params.id, ownedBy: req.user.id });
  if (!site) return res.status(404).json({ error: "Site not found." });
  const browsers = await req.app
    .get("db")
    .collection("browsers")
    .findOne({ token: site.token });
  return res.status(200).json(browsers);
});

route.get("/:id/analytics/errors", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ id: req.params.id, ownedBy: req.user.id });
  if (!site) return res.status(404).json({ error: "Site not found." });
  const errors = await req.app
    .get("db")
    .collection("errors")
    .findOne({ token: site.token });
  return res.status(200).json(errors);
});

route.delete("/:id/analytics/errors/:errorId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ id: req.params.id, ownedBy: req.user.id });
  if (!site) return res.status(404).json({ error: "Site not found." });
  let error = await req.app
    .get("db")
    .collection("errors")
    .findOne({ token: site.token });
  error.splice(
    error.findIndex((a) => a.bucketId === req.params.errorId),
    1
  );
  await req.app
    .get("db")
    .collection("errors")
    .updateOne({ token: site.token }, { $set: { buckets: error } });
  res.status(204).end();
});

export default route;
