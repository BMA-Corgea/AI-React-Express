const today = new Date();
const currentTime =
  today.getMonth() +
  1 +
  "/" +
  today.getDate() +
  "/" +
  today.getFullYear() +
  " at " +
  today.getHours() +
  ":" +
  today.getMinutes() +
  ":" +
  today.getSeconds();

function makeTimeStamp() {
  let month = today.getMonth() + 1;
  let day = today.getDate();
  let year = today.getFullYear();
  let hour = today.getHours();
  let minute = today.getMinutes();
  let second = today.getSeconds();

  return (
    month + "/" + day + "/" + year + " at " + hour + ":" + minute + ":" + second
  );
}

console.log(makeTimeStamp());

module.exports = { currentTime, makeTimeStamp };
