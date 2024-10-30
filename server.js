const express = require("express");
const CryptoJS = require("crypto-js");
const stringifySafe = require("json-stringify-safe");
const { MongoClient, ServerApiVersion } = require("mongodb");
const axios = require("axios");
const path = require('path');
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public', 'site')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: "cookie",
  secret: process.env["cookieSecret"],
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3 * 24 * 60 * 60 * 1000,secure:true },
}));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

app.use((req, res, next) => {
  if (req.path !== '/' && req.path.startsWith('/site/')) {
    req.url = req.url.replace('/site', '');
  }
  if (req.path !== '/' && req.path.startsWith('/panel/')) {
    req.url = req.url.replace('/panel', '');
  }
  if (req.path.endsWith('.html')) {
    return res.redirect(301, req.path.slice(0, -5));
  }
  next();
});

function formatDateTime(dateTime) {
  const options = {
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: true,
  };
  return dateTime.toLocaleString(undefined, options);
}

const byte = (str) => {
  let size = new Blob([str]).size;
  return size;
};

function encrypt(text, pass) {
  return CryptoJS.AES.encrypt(text, pass).toString();
}

function decrypt(text, pass) {
  return CryptoJS.AES.decrypt(text, pass).toString(CryptoJS.enc.Utf8);
}

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function rand(min, max) {
  return Math.random() * (max - min + 1) + min;
}

const uri = process.env["mongoURL"];
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db_name = "pixelit";
const db = client.db(db_name);
const users = db.collection("users");
const badges = db.collection("badges");
const news = db.collection("news");
const chatm = db.collection("chat");
const packs = db.collection("packs");

async function run() {
  try {
    await client.connect();
    await client.db(db_name).command({ ping: 1 });
    requests = await client.db(db_name).collection("requests").find().toArray();
    console.log("Successfully connected to the database");
  } catch (e) {
    console.log(e);
  }
}
run().catch(console.dir);

const timezoneOffset = new Date().getTimezoneOffset();
const localTime = new Date(Date.now() - timezoneOffset * 60 * 1000);
const router = require("./routes.js");
app.use(router);

const port = 3000;
const encpass = process.env["encpass"];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("getTokens", async (name) => {
    const user = await users.findOne({ username: name });
    if (user === null) return;
    io.to(socket.id).emit("tokens", user.tokens, user.sent, user.packsOpened);
  });
  socket.on("message", async (message) => {
    console.log("sending message")
    try {
        if (byte(message) > 1000 || message.trim() === "") {
          console.log("message too long")
            return;
        }

        const cookief = socket.handshake.headers.cookie;
        console.log("getting response")
        const response = await axios.get(
            "https://pixelit.replit.app/user",
            {
                headers: {
                    Cookie: cookief,
                },
                validateStatus: function (status) {
                    return (status >= 200 && status < 300) || status === 500; 
                },
                withCredentials: true,
            },
        );
        console.log(response)
        if (response.status !== 500) {
            const name = response.data.username;
            const d = new Date();
            d.setHours(d.getHours() - 4); // todo: don't hardwire timezone
            const user = await users.findOne({ username: name });
            const chatmessage = {
                sender: name,
                msg: message,
                badges: user.badges,
                pfp: user.pfp,
            };

            await chatm.insertOne(chatmessage);
            await users.updateOne(
                { username: name },
                { $set: { sent: user.sent + 1 } },
            );
            await users.updateOne(
                { username: name },
                { $set: { tokens: user.tokens + 1 } },
            );

            io.emit("chatupdate", "get");
            console.log("message sent")
        } else {
            socket.emit("error", response.data);
        }
    } catch (error) {
        console.error("Error during message handling:", error);
    }
  });

  socket.on("getChat", async () => {
    socket.emit("chatupdate", await chatm.find().toArray());
  });
  
  socket.on("getNews", async () => {
    //await client.connect();
    const newsPosts = await news.find().toArray();
    io.to(socket.id).emit("getNews", newsPosts);
  });
  socket.on("newspost", async (info) => {
    //await client.connect();
    const newsPost = {
      title: info.title,
      content: info.content,
      author: info.author,
      date: info.date,
    };
    const sender = await users.findOne({ username: info.author });
    if (
      validatePassword(info.pass, sender.password, sender.salt) &&
      admins.includes(info.author)
    ) {
      await news.insertOne(newsPost);
      console.log("posted news: " + info.title);
    }
  });
  socket.on("addPack", async (pack, user) => {
    //await client.connect();
    const newpack = {
      name: pack.name,
      image: pack.image,
      cost: pack.cost,
      blooks: [],
    };
    const person = await users.findOne({ username: user.name });
    if (
      validatePassword(user.pass, person.password, person.salt) &&
      admins.includes(user.name)
    ) {
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
      io.to(socket.id).emit("getPacks", "get");
    } else console.log("addpack verification denied " + user.name);
  });
  socket.on("addBlook", async (blook, user) => {
    const person = await users.findOne({ username: user.name });
    if (
      validatePassword(user.pass, person.password, person.salt) &&
      admins.includes(user.name)
    ) {
      await packs
        .updateOne(
          { name: blook.parent },
          {
            $push: {
              blooks: {
                name: blook.name,
                imageUrl: blook.image, 
                rarity: blook.rarity,
                chance: blook.chance, 
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
      await users
        .updateMany(
          { "packs.name": blook.parent },
          { $addToSet: { "packs.$[pack].blooks": blook } },
          { arrayFilters: [{ "pack.name": blook.parent }] },
        )
        .then((result) => {
          console.log("Update operation result:", result);
        })
        .catch((error) => {
          console.error("Error updating database:", error);
        });
      console.log(`added new blook to ${blook.parent}: ` + blook.name);
      io.to(socket.id).emit("getPacks", "get");
    } else console.log("addblook verification denied " + user.name);
  });
  socket.on("removePack", async (pack, user) => {
    const newpack = {
      name: pack.name,
      image: pack.image,
      cost: pack.cost,
      blooks: [],
    };

    const person = await users.findOne({ username: user.name });
    if (
      validatePassword(user.pass, person.password, person.salt) &&
      admins.includes(user.name)
    ) {
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
          { "packs.name": pack.name }, 
          { $pull: { packs: { name: pack.name } } },
        )
        .then((result) => {
          console.log("Update operation result:", result);
        })
        .catch((error) => {
          console.error("Error updating database:", error);
        });
      console.log("deleted pack: " + pack.name);
      io.to(socket.id).emit("getPacks", "get");
    } else console.log("removepack verification denied " + user.name);
  });
  socket.on("removeBlook", async (blook, user) => {
    const person = await users.findOne({ username: user.name });
    if (
      validatePassword(user.pass, person.password, person.salt) &&
      admins.includes(user.name)
    ) {
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
          { "packs.name": blook.parent, "packs.blooks.name": blook.name },
          { $pull: { "packs.$[pack].blooks": { name: blook.name } } },
          { arrayFilters: [{ "pack.name": blook.parent }] },
        )
        .then((result) => {
          console.log("Update operation result:", result);
        })
        .catch((error) => {
          console.error("Error updating database:", error);
        });
      console.log(`removed blook from ${blook.parent}: ` + blook.name);
      io.to(socket.id).emit("getPacks", "get");
    } else console.log("removeblook verification denied " + user.name);
  });
  socket.on("getPacks", async () => {
    const packsArray = await packs.find().toArray();
    io.to(socket.id).emit("getPacks", packsArray);
  });
  socket.on("openPack", async (opack, user) => {

    const person = await users.findOne({ username: user.name });

    if (person === null) return;

    if (!validatePassword(user.pass, person.password, person.salt)) {
      console.log("False password");
      return;
    }

    const pack = await packs.findOne({ name: opack.name });

    if (pack === null) {
      console.log("Invalid pack");
      return;
    }

    if (person.tokens < pack.cost) return;

    const blooks = pack.blooks;
    let totalchance = 0;
    for (const b of blooks) {
      totalchance += Number(b.chance);
    }
    const randnum = rand(0, totalchance);
    let currentchance = 0;

  
    for (const b of blooks) {
      const blook = b;

      if (
        randnum >= currentchance &&
        randnum <= currentchance + Number(blook.chance)
      ) {
        const result = await users.updateOne(
          {
            username: user.name,
            "packs.name": pack.name,
            "packs.blooks.name": blook.name,
          },
          {
            $inc: { "packs.$[pack].blooks.$[blook].owned": 1, packsOpened: 1 },
          },
          {
            arrayFilters: [
              { "pack.name": pack.name },
              { "blook.name": blook.name },
            ],
          },
        );
        await users.updateOne(
          { username: user.name },
          { $inc: { tokens: -pack.cost } },
        );

        console.log(
          `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        );

        io.to(socket.id).emit("openPack", {
          pack: pack.name,
          blook: blook,
        });
        const testuser = await users.findOne({ username: user.name });
        io.to(socket.id).emit("tokens", await testuser.tokens);

        console.log(`${user.name} opened ${pack.name} and got ${blook.name}`);
      }
      currentchance += Number(blook.chance);
    }
  });
  socket.on("getUserPacks", async (name) => {
    const user = await users.findOne({ username: name });
    if (user === null) return;
    io.to(socket.id).emit("getUserPacks", user.packs);
  });
  socket.on("getAccounts", async () => {
    const accounts = await users.find().toArray();

    io.to(socket.id).emit("getAccounts", accounts);
  });
  socket.on("getBadges", async () => {
    //await client.connect();
    const badgeese = await badges.find().toArray();

    io.to(socket.id).emit("getBadges", badgeese);
  });
  socket.on("getUserBadges", async (name) => {
    //await client.connect();
    const user = await users.findOne({ username: name });
    if (user === null) return;
    io.to(socket.id).emit("getUserBadges", user.badges);
  });
  socket.on("addBadge", async (data) => {
    //await client.connect();
    const { username, badge } = data;
    await users.updateOne({ username }, { $addToSet: { badges: badge } });
    const updatedUser = await users.find().toArray();
    io.emit("badgeUpdate", updatedUser);
  });

  socket.on("removeBadge", async (data) => {
    //await client.connect();
    const { username, badge } = data;
    await users.updateOne({ username }, { $pull: { badges: badge } });
    const updatedUser = await users.find().toArray();
    io.emit("badgeUpdate", updatedUser);
  });
  socket.on("createBadge", async (badge) => {
    //await client.connect();
    await badges.insertOne(badge);
  });
  socket.on("deleteBadge", async (badge) => {
    //await client.connect();
    await badges.deleteOne(badge);
    await users.updateMany({}, { $pull: { badges: badge } });
  });
});

server.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
  console.log(`Server is running at ${process.env["DEV_LINK"]}:${port}`);
});
console.log("Initializing server...");