const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env["mongoURL"];
const db_name = "pixelit";
const CryptoJS = require("crypto-js");

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run() {
    try {
        await client.connect();
        await client.db(db_name).command({ ping: 1 });

        requests = await client.db(db_name).collection("requests").find().toArray();

        console.log("Pinged your deployment. You successfully connected to MongoDB!",);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);

const db = client.db(db_name);
const packs = db.collection("packs");
const encpass = process.env["encpass"]; // encryption password

function generatePasswordHash(password, salt) {
    let passwordWordArray = CryptoJS.enc.Utf8.parse(password);
    const saltWordArray = CryptoJS.enc.Hex.parse(salt);
    passwordWordArray.concat(saltWordArray);
    return CryptoJS.HmacSHA256(passwordWordArray, encpass).toString(
        CryptoJS.enc.Hex,
    );
}

function validatePassword(password, saved_hash, salt) {
    const generated_hash = generatePasswordHash(password, salt);
    return generated_hash == saved_hash;
}

router.get("/user", async (req, res) => {
    const session = req.session;
    if (session.loggedIn) {
        const db = client.db(db_name);
        const collection = db.collection("users");
        const user = await collection.findOne({ username: session.username });
        if (user) {
            res.status(200).send({
                username: user.username,
                uid: user._id,
                tokens: user.tokens,
                packs: user.packs,
                pfp: user.pfp,
                banner: user.banner,
                badges: user.badges,
                role: user.role,
                spinned: user.spinned,
                stats: { sent: user.sent, packsOpened: user.packsOpened },
            });
        } else {
            throw Error("MongoDB error: could not read properties of undefined reading \"user\"");
        }
    } else {
        res.status(500).send("you are not logged in");
    }
});

router.post("/login", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(db_name);
        const collection = db.collection("users");
        const name = req.body.username;
        const pass = req.body.password;
        const user = await collection.findOne({ username: name });
        if (user) {
            if (validatePassword(pass, user.password, user.salt)) {
                req.session.loggedIn = true;
                req.session.username = user.username;
                req.session.tokens = user.tokens;
                req.session.uid = user._id;
                req.session.packs = user.packs;
                req.session.stats = { sent: user.sent, packsOpened: user.packsOpened };
                req.session.pfp = user.pfp;
                req.session.banner = user.banner;
                req.session.badges = user.badges;
                req.session.spinned = user.spinned;
                res.sendStatus(200);
            } else {
                res.status(500).send("Password is incorrect!");
            }
        } else {
            res.status(500).send("User not found!");
        }
    } catch (err) {
        console.error(err);
        res.status(502).send("Server error!");
    }
});

/*router.post("/register", limiter, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(db_name);
    const users = db.collection("users");
    const userRequests = db.collection("requests");
    const user = await users.findOne({ username: req.body.username });

    if (user === null) {
      const request = await userRequests.findOne({
        username: req.body.username,
      });
      if (request === null) {
        console.log("adding request");
        const salt = generateSalt();
        const timezone = formatDateTime(localTime);
        await userRequests.insertOne({
          username: req.body.username,
          password: generatePasswordHash(req.body.password, salt),
          salt: salt,
          tokens: 0,
          spinned: 0,
          reason: req.body.reason,
          date: timezone,
        });
        res.sendStatus(200);
      } else {
        res.status(500).send("request has already been sent!");
      }
    } else {
      res.status(500).send("user already exists!");
    }
  } catch (err) {
    console.error(err);
    res.status(502).send("Server Error!");
  }
});*/

router.get("/requests", async (req, res) => {
    await client.connect();
    if (req.session.loggedIn) {
        const db = client.db(db_name);
        const collection = db.collection("users");
        const user = await collection.findOne({ username: req.session.username });
        if (user) {
            if (["Owner", "Admin", "Moderator", "Helper"].includes(user.role) || !!user.role) {
                const requests = await client
                    .db(db_name)
                    .collection("requests")
                    .find()
                    .toArray();
                res.status(200).send(requests);
            } else {
                res.status(500).send("You're not a staff member");
            }
        } else {
            res.status(500).send("The account your under does not exist");
        }
    } else {
        res.status(500).send("You're not logged in");
    }
});

router.post("/addAccount", async (req, res) => {
    await client.connect();
    const db = client.db(db_name);
    const users = db.collection("users");
    const userRequests = db.collection("requests");
    //const epass = encrypt(pass, encpass);

    const person = await users.findOne({ username: req.session.username });
    if (
        person &&
        (["Owner", "Admin", "Moderator", "Helper"].includes(person.role) || !!person.role)
    ) {
        const request = await userRequests.findOne({ username: req.body.username });
        if (req.body.accepted) {
            if (request !== null) {
                if (req.body.accepted == true) {
                    await userRequests.deleteOne({ username: req.body.username });
                    await users.insertOne({
                        username: req.body.username,
                        password: req.body.password,
                        salt: req.body.salt,
                        tokens: 0,
                        spinned: 0,
                        pfp: "logo.png",
                        banner: "defaultBanner.svg",
                        role: "Common",
                        sent: 0,
                        packs: await packs.find().toArray(),
                        badges: [],
                    });
                }
                res.status(200).send("User accepted");
            } else {
                res.status(500).send("The request doesnt exist.");
            }
        } else {
            await userRequests.deleteOne({ username: req.body.username });
            res.status(200).send("User declined");
        }
    } else {
        res.status(200).send("You dont exist or you are not a staff member");
    }
});

router.post("/changePassword", async (req, res) => {
    await client.connect();
    const db = client.db(db_name);
    const users = db.collection("users");

    const user = await users.findOne({ username: req.session.username });

    if (user && user.role == "Owner") {
        const person = await users.findOne({ username: req.body.username });
        if (person != null) {
            users.updateOne(
                { username: req.body.username },
                {
                    $set: {
                        password: generatePasswordHash(req.body.new_password, person.salt),
                    },
                },
            );
            res.status(200).send("OK");
        } else {
            res.status(404).send("Not Found");
        }
    } else {
        res.status(403).send("Forbidden");
    }
});

router.post("/changePfp", async (req, res) => {
    const session = req.session;
    if (session && session.loggedIn) {
        try {
            await client.connect();
            const db = client.db(db_name);
            const users = db.collection("users");
            const result = await users.updateOne(
                { username: session.username },
                { $set: { pfp: req.body.pfp } },
            );
            if (result.modifiedCount > 0) {
                res
                    .status(200)
                    .send({ message: "Profile picture updated successfully." });
            } else {
                res.status(500).send({ message: "Failed to update profile picture." });
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            res.status(500).send({ message: "Internal server error." });
        }
    } else {
        res.status(401).send({
            message: "You must be logged in to change your profile picture.",
        });
    }
});

module.exports = router;