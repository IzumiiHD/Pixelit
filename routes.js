const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env["mongoURL"];
const db_name = "pixelit";
const CryptoJS = require("crypto-js");
const stringifySafe = require("json-stringify-safe");
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
const encpass = process.env["encpass"]; // encryption password
function encrypt(text, pass) {
  var encrypted = CryptoJS.AES.encrypt(text, pass).toString();
  return encrypted;
}

function decrypt(text, pass) {
  var decrypted = CryptoJS.AES.decrypt(text, pass).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

function generatePasswordHash(password, salt) {
  let passwordWordArray = CryptoJS.enc.Utf8.parse(password);
  const saltWordArray = CryptoJS.enc.Hex.parse(salt);
  passwordWordArray.concat(saltWordArray);
  return CryptoJS.HmacSHA256(passwordWordArray, encpass).toString(
    CryptoJS.enc.Hex,
  );
}

function generateSalt() {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

function validatePassword(password, saved_hash, salt) {
  const generated_hash = generatePasswordHash(password, salt);
  return generated_hash == saved_hash;
}
router.get('/user' , async (req,res)=>{
  const session = req.session
  if(session.loggedIn){
  const db = client.db(db_name)
  const collection = db.collection("users")
  const user = await collection.findOne({username: session.username})
  if (user){
    res.status(200).send({'username': user.username, 'uid': user._id, 'tokens': user.tokens, 'packs': user.packs, 'pfp': user.pfp,'banner': user.banner, 'badges': user.badges, 'role': user.role,'spinned': user.spinned,'stats': {'sent':user.sent,'packsOpened': user.packsOpened}})
  }
  }else{
    res.status(500).send("you are not logged in")
  }
})
router.post('/login', async (req, res) => {
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
        req.session.stats = { 'sent': user.sent, 'packsOpened': user.packsOpened };
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
router.post('/register', async (req,res) =>{
  try{
  await client.connect();
  const db = client.db(db_name);
  const users = db.collection("users");
  const userRequests = db.collection("requests");
  const user = await users.findOne({ username: req.body.username });

  if (user === null) {
    const request = await userRequests.findOne({ username: req.body.username });
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
    } else{ res.status(500).send("request has already been sent!") };
  } else{ res.status(500).send("user already exists!") };
  }catch (err){
   console.error(err)
   res.status(502).send("Server Error!")
  }
})
module.exports = router;