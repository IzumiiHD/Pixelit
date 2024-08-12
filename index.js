const express = require("express");
const app = express();
const CryptoJS = require("crypto-js");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env["mongoURL"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
const session = require("express-session");
app.use(
  session({
    name: "cookie",
    secret: process.env["cookieSecret"],
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3 * 24 * 60 * 60 * 1000 },
  }),
);
const timezoneOffset = new Date().getTimezoneOffset();
const localTime = new Date(Date.now() - timezoneOffset * 60 * 1000);
const router = require("./routes.js");
app.use(router);
const db_name = "pixelit";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let requests;
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(db_name).command({ ping: 1 }); /*
    const packs = await client.db("pixelit").collection("packs").find().toArray()
    console.log(packs[0].blooks)*/

    requests = await client.db(db_name).collection("requests").find().toArray();
    //console.log(requests);

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const db = client.db(db_name);
const users = db.collection("users");
const badges = db.collection("badges");
const news = db.collection("news");
const chatm = db.collection("chat"); // mongodb chat
const packs = db.collection("packs");
// socket.io setup
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

const fs = require("fs");

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

function rand(min, max) {
  return /*Math.floor(*/ Math.random() * (max - min + 1) /*)*/ + min;
}

app.use(express.static("public"));

app.get("/", (_, res) =>
    res.sendFile(__dirname + "/public/site/index.html"));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("getTokens", async (name) => {
    await client.connect();
    const user = await users.findOne({ username: name });
    if (user === null) return;
    //console.log(user)
    //const jsonData1 = fs.readFileSync(fileName, 'utf8');
    //accounts = JSON.parse(jsonData1);
    io.to(socket.id).emit("tokens", user.tokens, user.sent, user.packsOpened);
  });
  socket.on("message", async (name, message) => {
    await client.connect(); /*
    const jsonData1 = fs.readFileSync("./chat.json", "utf8");
    const chat = JSON.parse(jsonData1);*/
    const d = new Date();
    d.setHours(d.getHours() - 4);
    const user = await users.findOne({ username: name });
    const chatmessage = {
      sender: name,
      message,
      timestamp: formatDateTime(localTime),
    };
    //chat[messageId] = chatmessage;
    await chatm.insertOne(chatmessage);
    await users.updateOne(
      { username: name },
      { $set: { sent: user.sent + 1 } },
    );
    await users.updateOne(
      { username: name },
      { $set: { tokens: user.tokens + 1 } },
    );
    /*accounts[name].tokens += 1;
    fs.writeFile(fileName, stringifySafe(accounts), function writeJSON(err) {
      if (err) return console.log(err);
    });*/
    io.emit("chatupdate", "get");
  });
  socket.on("getChat", async () => {
    await client.connect();
    //const jsonData1 = fs.readFileSync("./chat.json", "utf8");
    //const chat = JSON.parse(jsonData1);
    socket.emit("chatupdate", await chatm.find().toArray());
  });
  socket.on("spin", async (name) => {
    await client.connect();
    const user = await users.findOne({ username: name });
    if (
      user &&
      (!user.hasOwnProperty("spinned") ||
        typeof user.spinned !== "number" ||
        Date.now() - user.spinned >= 3600000)
    ) {
      const gained = Math.floor(500 + Math.random() * 1000);
      await users.updateOne(
        { username: name },
        { $inc: { tokens: gained, spinned: Date.now() } },
      );
      io.to(socket.id).emit("spinned", gained);
      console.log(`${name} gained ${gained} tokens!`);
    }
  });
  socket.on("getNews", async () => {
    await client.connect();
    const newsPosts = await news.find().toArray();
    io.to(socket.id).emit("getNews", newsPosts);
  });
  socket.on("newspost", async (info) => {
    await client.connect();
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
    await client.connect();
    const newpack = {
      name: pack.name,
      image: pack.image,
      cost: pack.cost,
      blooks: [],
    };
    //console.log(pack);
    //console.log(user);
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
    await client.connect();
    //const parent = blook.parent;
    /*const blook = {
      name: blook.name,
      image: blook.image,
      rarity: blook.cost,
      chance: blook.chance,
    };*/
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
      await users
        .updateMany(
          { "packs.name": blook.parent }, // Match documents where the parent pack exists
          { $addToSet: { "packs.$[pack].blooks": blook } }, // Add the blook to the blooks array of the specified pack
          { arrayFilters: [{ "pack.name": blook.parent }] }, // Specify the array filter to identify the pack to update
        )
        .then((result) => {
          console.log("Update operation result:", result);
        })
        .catch((error) => {
          console.error("Error updating database:", error);
        });
      console.log(`added new blook to ${blook.parent}: ` + blook.name);
      io.to(socket.id).emit("getPacks", "get");
      //console.log(await packs.findOne({name: blook.parent}));
    } else console.log("addblook verification denied " + user.name);
  });
  socket.on("removePack", async (pack, user) => {
    await client.connect(); /*
    const newpack = {
      name: pack.name,
      image: pack.image,
      cost: pack.cost,
      blooks: [],
    };*/
    //console.log(pack);
    //console.log(user);
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
          { "packs.name": pack.name }, // Match documents where the pack exists in the packs array
          { $pull: { packs: { name: pack.name } } }, // Remove the pack from the packs array
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
    await client.connect();
    //const parent = blook.parent;
    /*const blook = {
      name: blook.name,
      image: blook.image,
      rarity: blook.cost,
      chance: blook.chance,
    };*/
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
      io.to(socket.id).emit("getPacks", "get");
      //console.log(await packs.findOne({name: blook.parent}));
    } else console.log("removeblook verification denied " + user.name);
  });
  socket.on("getPacks", async () => {
    await client.connect();
    const packsArray = await packs.find().toArray();
    io.to(socket.id).emit("getPacks", packsArray);
  });
  socket.on("openPack", async (opack, user) => {
    await client.connect();
    //console.log("openpackreq");

    // Retrieve user data from MongoDB
    const person = await users.findOne({ username: user.name });
    //console.log("Retrieved user data:", person); // Log retrieved user data

    if (person === null) return;

    // Validate password
    if (!validatePassword(user.pass, person.password, person.salt)) {
      console.log("False password");
      return;
    }

    // Retrieve pack data from MongoDB
    const pack = await packs.findOne({ name: opack.name });
    //console.log("Retrieved pack data:", pack); // Log retrieved pack data

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

    //console.log(pack);

    //console.log("test", randnum, totalchance);

    for (const b of blooks) {
      const blook = b;
      //console.log("Current blook:", blook); // Log current blook

      if (
        randnum >= currentchance &&
        randnum <= currentchance + Number(blook.chance)
      ) {
        //console.log("Selected blook:", blook); // Log selected blook

        // Update user data in MongoDB
        /*await users
          .updateOne(
            { username: person.name },
            { $inc: { [`packs.${pack.name}.blooks.${blook.name}.owned`]: 1 } },
          )
          .then((result) => {
            console.log("Update operation result:", result);
          })
          .catch((error) => {
            console.error("Error updating database:", error);
          });*/
        /*
        await users
          .updateOne(
            { username: person.name }, // Identify the user based on some unique identifier
            {
              $inc: {
                "packs.$[packName].blooks.$[blookName].owned": 1, // Update the owned property of the specific blook
              },
            },
            {
              arrayFilters: [
                { "packName.name": pack.name }, // Filter to find the specific pack within the packs array
                { "blookName.name": blook.name }, // Filter to find the specific blook within the blooks array of the selected pack
              ],
            },
          )
          .then((result) => {
            console.log("Update operation result+$:37&+:", result);
          });
*/
        // Emit openPack event with selected blook
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
    await client.connect();
    const user = await users.findOne({ username: name });
    if (user === null) return;
    //console.log(user.packs)
    io.to(socket.id).emit("getUserPacks", user.packs);
  });
  socket.on("getAccounts", async () => {
    await client.connect();
    const accounts = await users.find().toArray();

    io.to(socket.id).emit("getAccounts", accounts);
  });
  socket.on("getBadges", async () => {
    await client.connect();
    const badgeese = await badges.find().toArray();

    io.to(socket.id).emit("getBadges", badgeese);
  });
  socket.on("getUserBadges", async (name) => {
    await client.connect();
    const user = await users.findOne({ username: name });
    if (user === null) return;
    io.to(socket.id).emit("getUserBadges", user.badges);
  });
  socket.on("addBadge", async (data) => {
    await client.connect();
    const { username, badge } = data;
    await users.updateOne({ username }, { $addToSet: { badges: badge } });
    const updatedUser = await users.find().toArray();
    io.emit("badgeUpdate", updatedUser);
  });

  socket.on("removeBadge", async (data) => {
    await client.connect();
    const { username, badge } = data;
    await users.updateOne({ username }, { $pull: { badges: badge } });
    const updatedUser = await users.find().toArray();
    io.emit("badgeUpdate", updatedUser);
  });
  socket.on("createBadge", async (badge) => {
    await client.connect();
    await badges.insertOne(badge);
  });
  socket.on("deleteBadge", async (badge) => {
    await client.connect();
    await badges.deleteOne(badge);
    await users.updateMany({}, { $pull: { badges: badge } });
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(process.env["mongoURL"]);
});
//3.6 mil ms in an hour
console.log("Server loaded");
