const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env["mongoURL"];
const db_name = "pixelit";
const CryptoJS = require("crypto-js");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, 
  message: "Too many requests, please try again after 15 minutes",
  standardHeaders: true, 
  legacyHeaders: false, 
});

const packOpenLimiter = rateLimit({
  windowMs: 1000,
  max: 2, 
  message: "Too many pack openings, please try again later.",
  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests, please try again later." });
  }
});

function rand(min, max) {
  return /*Math.floor(*/ Math.random() * (max - min + 1) /*)*/ + min;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let requests;
function formatDateTime(dateTime) {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return dateTime.toLocaleString(undefined, options);
}

const timezoneOffset = new Date().getTimezoneOffset();
const localTime = new Date(Date.now() - timezoneOffset * 60 * 1000);
async function run() {
  try {
    await client.connect();
    await client.db(db_name).command({ ping: 1 }); 

    requests = await client.db(db_name).collection("requests").find().toArray();
  } catch {
    console.log("mongodb connection error");
  } /*finally {
    await client.close();
  }*/
}
run().catch(console.dir);

const db = client.db(db_name);
const users = db.collection("users");
const badges = db.collection("badges");
const news = db.collection("news");
const chatm = db.collection("chat");
const packs = db.collection("packs");

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
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
    }
  } else {
    res.status(500).send("You are not logged in");
  }
});
router.post("/login", async (req, res) => {
  try {
    const db = client.db(db_name);
    const collection = db.collection("users");
    const name = req.body.username;
    const pass = req.body.password;
    const user = await collection.findOne({ username: name });
    if (user) {
      if (await validatePassword(pass, user.password)) {
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
        res.status(500).send("Username or Password is incorrect!");
      }
    } else {
      res.status(500).send("User not found!");
    }
  } catch (err) {
    console.error(err);
    res.status(502).send("Server error!");
  }
});

router.post("/register", limiter, async (req, res) => {
  try {
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
        const hashedPassword = await hashPassword(req.body.password);
        const timezone = formatDateTime(localTime);
        await userRequests.insertOne({
          username: req.body.username,
          password: hashedPassword,
          age: req.body.age,
          reason: req.body.reason,
          date: timezone,
        });
        res.sendStatus(200);
      } else {
        res.status(500).send("Request has already been sent!");
      }
    } else {
      res.status(500).send("That username already exists!");
    }
  } catch (err) {
    console.error(err);
    res.status(502).send("Server Error!");
  }
});

router.get("/requests", async (req, res) => {
  //await client.connect();
  if (req.session.loggedIn) {
    const db = client.db(db_name);
    const collection = db.collection("users");
    const user = await collection.findOne({ username: req.session.username });
    if (user) {
      if (["Owner", "Admin", "Moderator", "Helper"].includes(user.role)) {
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
  const db = client.db(db_name);
  const users = db.collection("users");
  const userRequests = db.collection("requests");

  const person = await users.findOne({ username: req.session.username });
  if (
    person &&
    ["Owner", "Admin", "Moderator", "Helper"].includes(person.role)
  ) {
    const request = await userRequests.findOne({ username: req.body.username });
    if (req.body.accepted) {
      if (request !== null) {
        if (req.body.accepted == true) {
          await userRequests.deleteOne({ username: req.body.username });
          // Use the hashed password from the request
          await users.insertOne({
            username: req.body.username,
            password: request.password,
            pfp: "logo.png",
            banner: "pixelitBanner.png",
            role: "Player",
            tokens: 0,
            spinned: 0,
            sent: 0,
            packs: await packs.find().toArray(),
            badges: [],
          });
        }
        try {
          io.emit("getAccounts", "get");
        } catch (e) {
          console.log(e);
        }
        res.status(200).send("User accepted");
      } else {
        res.status(500).send("The request doesn't exist.");
      }
    } else {
      await userRequests.deleteOne({ username: req.body.username });
      res.status(200).send("User declined");
    }
  } else {
    res.status(200).send("You don't exist or you are not a staff member");
  }
});

router.post("/changePassword", async (req, res) => {
  const db = client.db(db_name);
  const users = db.collection("users");

  const user = await users.findOne({ username: req.session.username });

  if (user && user.role == "Owner") {
    const person = await users.findOne({ username: req.body.username });
    if (person != null) {
      const hashedPassword = await hashPassword(req.body.new_password);
      await users.updateOne(
        { username: req.body.username },
        {
          $set: {
            password: hashedPassword,
          },
        },
      );
      res.status(200).send("Ok");
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
      //await client.connect();
      console.log(req.body);
      const db = client.db(db_name);
      const users = db.collection("users");
      const body = req.body;
      const pack = session.packs.find((pack) => pack.name == body.parent);
      if (!pack || pack === null) return;
      const blook = pack.blooks.find((blook) => blook.name == body.name);
      console.log(blook);
      if (session.pfp == blook.image) {
        res
          .status(200)
          .send({ message: "This is already your profile picture" });
        return;
      }
      if (blook && blook.owned >= 1) {
        const result = await users.updateOne(
          { username: session.username },
          { $set: { pfp: blook.image } },
        );
        if (result.modifiedCount > 0) {
          res
            .status(200)
            .send({ message: "Profile picture updated successfully." });
        } else {
          res
            .status(500)
            .send({ message: "Failed to update profile picture." });
        }
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

router.get("/packs", async (req, res) => {
  if (!req.session.loggedIn) {
    res.status(500).send("You must be logged in to access this page.");
    return;
  }
  //await client.connect();
  const db = client.db(db_name);
  const collection = db.collection("packs");
  const packs = await collection.find().toArray();
  res.status(200).send(packs);
});



router.get("/users", async (req, res) => {
  const session = req.session;
  if (!(session && session.loggedIn)) {
    res.status(500).send("You must be logged in");
    return;
  }
  const users2 = await users.find().toArray();
  users2.forEach((user) => {
    delete user.password;
    delete user.salt;
  });
  res.status(200).send({ users: users2 });
});

router.post("/addPack", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;

  const user = await users.findOne({ username: req.session.username });

  if (user == null || user.role !== "Owner") {
    console.log("need authorisation to add packs");
    res.status(500).send("Need authorisation to add packs");
    return;
  }
  const pack = req.body;

  const newpack = {
    name: pack.name,
    image: pack.image,
    cost: pack.cost,
    blooks: [],
  };
  try {
    await packs
      .insertOne(newpack)
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users
      .updateMany(
        { packs: { $nin: [pack.name] } },
        { $push: { packs: newpack } },
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
  } catch (e) {
    console.log(e);
  }
  console.log("added new pack: " + newpack.name);
  const packs2 = await packs.find().toArray();
  res.status(200).send({ packs: packs2 });
});

router.post("/removePack", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || user.role !== "Owner") {
    console.log("need authorisation to remove packs");
    res.status(500).send("Need authorisation to remove packs");
    return;
  }
  console.log("removing pack: " + req.body.name);
  const pack = req.body;
  try {
    await packs
      .deleteOne({ name: pack.name })
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users
      .updateMany(
        { "packs.name": pack.name }, // Match documents where the pack exists in the packs array
        { $pull: { packs: { name: pack.name } } }, // Remove the pack from the packs array
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
  } catch (e) {
    console.log(e);
  }
  const packs2 = await packs.find().toArray();
  res.status(200).send({ packs: packs2 });
});

router.post("/addBlook", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || user.role !== "Owner") {
    console.log("need authorisation to add blooks");
    res.status(500).send("Need authorisation to add blooks");
    return;
  }
  const blook = req.body;

  try {
    await packs
      .updateOne(
        { name: blook.parent },
        {
          $push: {
            blooks: {
              name: blook.name, // Example: New blook name
              imageUrl: blook.image, // Example: URL of the blook image
              rarity: blook.rarity, // Example: Rarity of the blook
              chance: blook.chance, // Example: Chance of getting the blook (in percentage)
              parent: blook.parent,
              color: blook.color,
              owned: 0,
            },
          },
        },
      )
      .then((result) => {
        console.log("Update operation result:", result);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
      });
    await users.updateMany(
      { "packs.name": blook.parent }, // Match documents where the parent pack exists
      { $addToSet: { "packs.$[pack].blooks": blook } }, // Add the blook to the blooks array of the specified pack
      { arrayFilters: [{ "pack.name": blook.parent }] }, // Specify the array filter to identify the pack to update
    );
  } catch (e) {
    console.log(e);
  }
});

router.post("/removeBlook", async (req, res) => {
  const session = req.session;
  if (session == null || !session.loggedIn) return;
  const user = await users.findOne({ username: req.session.username });
  if (user == null || user.role !== "Owner") {
    console.log("need authorisation to add blooks");
    res.status(500).send("Need authorisation to add blooks");
    return;
  }
  const blook = req.body;

  await packs
    .updateOne(
      { name: blook.parent },
      {
        $pull: {
          blooks: {
            name: blook.name,
          },
        },
      },
    )
    .then((result) => {
      console.log("Update operation result:", result);
    })
    .catch((error) => {
      console.error("Error updating database:", error);
    });
  await users
    .updateMany(
      { "packs.name": blook.parent, "packs.blooks.name": blook.name }, // Match documents where the parent pack contains the blook
      { $pull: { "packs.$[pack].blooks": { name: blook.name } } }, // Remove the blook from the specified pack
      { arrayFilters: [{ "pack.name": blook.parent }] }, // Specify the array filter to identify the pack to update
    )
    .then((result) => {
      console.log("Update operation result:", result);
    })
    .catch((error) => {
      console.error("Error updating database:", error);
    });
  console.log(`removed blook from ${blook.parent}: ` + blook.name);
  res.status(200).send("Removed blook");
});

// Badge-related Routes from badgeeditor.js
router.get("/getAccounts", async (req, res) => {
  try {
    const usersList = await users.find().toArray();
    res.status(200).json(usersList);
  } catch (err) {
    res.status(500).send("Error retrieving users");
  }
});
router.get("/getBadges", async (req, res) => {
  try {
    const badgesList = await badges.find().toArray();
    res.status(200).json(badgesList);
  } catch (err) {
    res.status(500).send("Error retrieving badges");
  }
});
router.post("/addBadge", async (req, res) => {
  const { username, badge } = req.body;
  try {
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (!user.badges.includes(badge.name)) {
      await users.updateOne({ username }, { $push: { badges: badge.name } });
      res.status(200).json({ success: true });
    } else {
      res
        .status(400)
        .json({ success: false, msg: "User already has this badge!" });
    }
  } catch (err) {
    res.status(500).send("Error adding badge");
  }
});
router.post("/removeBadge", async (req, res) => {
  const { username, badge } = req.body;
  try {
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.badges.includes(badge.name)) {
      await users.updateOne({ username }, { $pull: { badges: badge.name } });
      res.status(200).json({ success: true });
    } else {
      res
        .status(400)
        .json({ success: false, msg: "User does not have this badge!" });
    }
  } catch (err) {
    res.status(500).send("Error removing badge");
  }
});

router.post('/spin', async (req, res) => {
  const session = req.session;
  if (!session.loggedIn) {
    return res.status(401).json({ message: "You are not logged in" });
  }

  const db = client.db(db_name);
  const spinsCollection = db.collection("spins");

  const userSpinData = await spinsCollection.findOne({ username: session.username });
  const now = Date.now();
  if (userSpinData && ((now - userSpinData.lastSpin) < 8 * 60 * 60 * 1000)) {
    return res.status(429).json({ message: "You can spin only once every 8 hours" });
  }

  const tokensWon = req.body.tokens;
  if (typeof tokensWon !== 'number' || isNaN(tokensWon)) {
    return res.status(400).json({ message: "Invalid token amount" });
  }

  try {
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { username: session.username },
      { 
        $inc: { 
          tokens: tokensWon,
          spinned: 1
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const spinData = { username: session.username, lastSpin: now };
    await spinsCollection.updateOne( 
      { username: session.username }, 
      { $set: spinData }, 
      { upsert: true } 
    );

    res.status(200).json({ 
      message: "Spin successful", 
      tokensWon: tokensWon
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const app = express();

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('username tokens rarity');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Body parser middleware to handle JSON requests
router.use(bodyParser.json());

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: '1.00', 
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://pixelit.replit.app/success',
    cancel_url: 'https://pixelit.replit.app/cancel',
    client_reference_id: req.session.username, 
  });

  res.json({ id: session.id });
});

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.client_reference_id;

    try {
      const filter = { username: userId };
      const update = { $set: { role: 'Plus' } };

      await users.updateOne(filter, update);

      console.log(`User ${userId} has been upgraded to the Plus role`);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }

  res.json({received: true});
});

router.post("/sellBlook", async (req, res) => {
  const { name, rarity, tokensToAdd } = req.body;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }
  try {
    const result = await users.updateOne(
      { username: username },
      { 
        $inc: { 
          tokens: tokensToAdd,
          [`packs.$[].blooks.$[blook].owned`]: -1
        }
      },
      {
        arrayFilters: [{ "blook.name": name }]
      }
    );
    if (result.modifiedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error selling blook:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/user", async (req, res) => {
  const session = req.session;
  if (session.loggedIn) {
    try {
      const user = await users.findOne({ username: session.username });
      if (user) {
        res.status(200).json({
          username: user.username,
          tokens: user.tokens,
          packs: user.packs,
          // Add any other user data you want to send to the frontend
        });
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(401).send("You are not logged in");
  }
});
// Route to get all packs
router.get("/packs", async (req, res) => {
  try {
    const allPacks = await packs.find().toArray();
    res.status(200).json(allPacks);
  } catch (error) {
    console.error("Error fetching packs:", error);
    res.status(500).send("Internal server error");
  }
});
router.get("/openPack", packOpenLimiter, async (req, res) => {
  const session = req.session;
  if (session && session.loggedIn) {
    const user = { name: session.username };
    const packName = req.query.pack;
    try {
      const person = await users.findOne({ username: user.name });
      const pack = await packs.findOne({ name: packName });
      if (!person || !pack) {
        return res.status(404).json({ error: "User or pack not found" });
      }
      if (person.tokens < pack.cost) {
        return res.status(400).json({ error: "Not enough tokens" });
      }
      const blooks = pack.blooks;
      let totalChance = blooks.reduce((sum, blook) => sum + Number(blook.chance), 0);
      const randNum = rand(0, totalChance);
      let currentChance = 0;
      let selectedBlook;
      for (const blook of blooks) {
        if (randNum >= currentChance && randNum <= currentChance + Number(blook.chance)) {
          selectedBlook = blook;
          break;
        }
        currentChance += Number(blook.chance);
      }
      if (!selectedBlook) {
        return res.status(500).json({ error: "Failed to select a blook" });
      }
      await users.updateOne(
        { username: user.name },
        {
          $inc: { 
            tokens: -pack.cost,
            [`packs.$[pack].blooks.$[blook].owned`]: 1,
            packsOpened: 1
          }
        },
        {
          arrayFilters: [
            { "pack.name": pack.name },
            { "blook.name": selectedBlook.name }
          ]
        }
      );
      res.status(200).json({ pack: pack.name, blook: selectedBlook });
      console.log(`${user.name} opened ${pack.name} and got ${selectedBlook.name}`);
    } catch (error) {
      console.error("Error opening pack:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

module.exports = router;
