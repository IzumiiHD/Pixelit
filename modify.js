const fs = require("fs");
const fileName = "./accounts.json";
let accounts = require(fileName);

for (const i in accounts) {
  accounts[i].lastspin = 0;
}

fs.writeFile(fileName, JSON.stringify(accounts), function writeJSON(err) {
  if (err) return console.log(err);
});

//SCRIPT TO MODIFY ACCOUNTS.JSON WITHOUT MANUALLY EDITING IT