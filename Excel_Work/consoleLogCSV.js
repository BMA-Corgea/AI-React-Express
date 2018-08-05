const fs = require("fs");

myReadStream = fs.createReadStream(__dirname + "/Book1.csv", "utf8");

myReadStream.on("data", function(chunk) {
  console.log("new chunk received:");
  console.log(chunk);
});
