require("dotenv").config();
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client();
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", msg => {
  if (!msg.content.startsWith("+")) return;
  const args = msg.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();
  if (command == "global_stat") {
    axios
      .get(`https://thevirustracker.com/free-api?global=stats`)
      .then(response => {
        printAll(msg, response.data.results[0], true);
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    axios
      .get(`https://thevirustracker.com/free-api?countryTotal=${args}`)
      .then(response => {
        if (command == "total_stat") {
          printAll(msg, response.data.countrydata[0], false);
        } else {
          printResult(msg, command, response.data.countrydata[0]);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
});

function printAll(msg, response, isGlobal) {
  return msg.reply(
    `${!isGlobal ? `Country : ${response.info.title}\n` : "Global Stats"}
    Total Cases : ${response.total_cases}\n
    Total Recovered : ${response.total_recovered}\n
    Total Unresolved : ${response.total_unresolved}\n
    Total Deaths : ${response.total_deaths}\n
    Total New Cases Today : ${response.total_new_cases_today}\n
    Total New Deaths Today : ${response.total_new_deaths_today}\n
    Total Active Cases : ${response.total_active_cases}\n
    Total Serious Cases : ${response.total_serious_cases}`
  );
}

function printResult(msg, command, response) {
  return msg.reply(
    `${command
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} in ${response.info.title} is ${response[command]}`
  );
}
client.login(process.env.BOT_TOKEN);
