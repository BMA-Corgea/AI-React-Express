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

console.log(currentTime);
