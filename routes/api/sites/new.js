import Express from "express";
import { Snowflake } from "nodejs-snowflake";
import crypto from "crypto";

const route = Express.Router();

async function sha256(message) {
  return await crypto
    .createHash("sha256")
    .update(message.toString())
    .digest("hex");
}

route.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized." });
  const { url } = req.body;
  const siteUrl = url.match(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim
  );
  if (!siteUrl) return res.status(400).json({ error: "Invalid site url." });
  const site = await req.app
    .get("db")
    .collection("sites")
    .findOne({ url: siteUrl[0] });
  if (site) return res.status(400).json({ error: "Site already exists." });
  const siteId = new Snowflake();
  const token = await sha256(siteId.getUniqueID());
  const siteData = {
    id: siteId.getUniqueID().toString(),
    url: siteUrl[0],
    token,
    ownedBy: req.user.id,
  };
  await req.app.get("db").collection("sites").insertOne(siteData);
  return res.status(200).json(siteData);
});

export default route;
