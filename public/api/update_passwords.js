const { MongoClient, ServerApiVersion } = require("mongodb");
const CryptoJS = require("crypto-js");

const client = new MongoClient(process.env["mongoURL"], {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  function decrypt(text, pass) {
    var decrypted = CryptoJS.AES.decrypt(text, pass).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
  
  function generatePasswordHash(password, salt) {
    let passwordWordArray = CryptoJS.enc.Utf8.parse(password);
    const saltWordArray = CryptoJS.enc.Hex.parse(salt);
    passwordWordArray.concat(saltWordArray);
    return CryptoJS.HmacSHA256(passwordWordArray, process.env["encpass"]).toString(CryptoJS.enc.Hex);
  }
  
  function generateSalt() {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }


  async function run() {
    try {
        await client.connect();
        const db = client.db("pixelit_testing");
        const users = db.collection("users");
        const usersArray = await users.find().toArray();

        for (const user of usersArray) {
            console.log(user.username);
            await updateUser(user.username);
        }

    } catch (e) {
        console.log("ERROR");
        console.log(e);
    } finally {
        await client.close();
    }
}

async function updateUser(username) {
    try {
        const db = client.db("pixelit_testing");
        const users = db.collection("users");
        const user = await users.findOne({ username: username });

        const passwordPlaintext = decrypt(user.password, process.env["encpass"]);

        const salt = generateSalt();
        const hash = generatePasswordHash(passwordPlaintext, salt);

        await users.updateOne(
            { username: username },
            { $set : { "salt": salt, "password": hash } }
        );
    } catch (e) {
        console.log("ERROR IN UPDATEUSER");
        console.log(e);
    } finally {
    }
}

run();