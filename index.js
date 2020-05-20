require("dotenv").config();
const Text = require("discord-markup");
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client();
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", (msg) => {
  if (!msg.content.startsWith("-")) return;
  const args = msg.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();
  if (command == "global_stat") {
    axios
      .get(`https://thevirustracker.com/free-api?global=stats`)
      .then((response) => {
        printAll(msg, response.data.results[0], true);
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (command == "help") {
    msg.reply(
      String(
        new Text(
          `\n-----------Command List-----------\n
#1 -global_stat\n
#2 -total_stat <Country-Code>: total_stat NP\n
#3 -total_cases <Country-Code>\n
#4 -total_recovered <Country-Code>\n
#5 -total_unresolved <Country-Code>\n
#6 -total_deaths <Country-Code>\n
#7 -total_new_cases_today <Country-Code>\n
#8 -total_new_deaths_today <Country-Code>\n
#9 -total_active_cases <Country-Code>\n
#10 -total_serious_cases <Country-Code>`
        ).codeblock()
      )
    );
  } else if (command == "today") {
    axios
      .get(`https://thevirustracker.com/free-api?countryTimeline=${args}`)
      .then((response) => {
        var timelineData = response.data.timelineitems[0];
        var todayKey = Object.keys(timelineData)[
          Object.keys(timelineData).length - 2
        ];
        var today = response.data.timelineitems[0][todayKey];

        msg.reply(
          String(
            new Text(
              `${response.data.countrytimelinedata[0].info.title}\n
            Date: ${todayKey}\n
             New Daily Cases : ${today.new_daily_cases}\n
             New Daily Deaths: ${today.new_daily_deaths}\n
             Total Cases: ${today.total_cases}\n
             Total Recoveries: ${today.total_recoveries}\n
             Total Deaths: ${today.total_deaths}\n
            
             `
            ).codeblock()
          )
        );
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    axios
      .get(`https://thevirustracker.com/free-api?countryTotal=${args}`)
      .then((response) => {
        if (command == "total_stat") {
          printAll(msg, response.data.countrydata[0], false);
        } else {
          printResult(msg, command, response.data.countrydata[0]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

function printAll(msg, response, isGlobal) {
  return msg.reply(
    String(
      new Text(
        `${
          !isGlobal
            ? `Country : ${response.info.title}\n`
            : "---------Global Stats---------"
        }
    Total Cases : ${response.total_cases}\n
    Total Recovered : ${response.total_recovered}\n
    Total Unresolved : ${response.total_unresolved}\n
    Total Deaths : ${response.total_deaths}\n
    Total New Cases Today : ${response.total_new_cases_today}\n
    Total New Deaths Today : ${response.total_new_deaths_today}\n
    Total Active Cases : ${response.total_active_cases}\n
    Total Serious Cases : ${response.total_serious_cases}`
      ).codeblock()
    )
  );
}

function printResult(msg, command, response) {
  return msg.reply(
    String(
      new Text(
        `${command
          .replace(/_/g, " ")
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} in ${response.info.title} is ${response[command]}`
      ).codeblock()
    )
  );
}
client.login(process.env.BOT_TOKEN);
