require("dotenv").config();
const Text = require("discord-markup");
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(function () {
    axios
      .get(`https://thevirustracker.com/free-api?countryTotal=np`)
      .then((response) => {
        client.user.setPresence({
          activity: {
            name: `${response.data.countrydata[0].total_cases} Cases in Nepal`,
            type: "WATCHING",
          },
          status: "online",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, 300000);
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
#10 -total_serious_cases <Country-Code>\n
#11 -today <Country-Code>`
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
  } else if (command == "rich") {
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor("#8a0303")
      .setTitle("Total Cases in Nepal")
      .setURL("https://thevirustracker.com/")
      .setAuthor("Corona Bot", "https://i.ibb.co/mN7xvrX/virus.png")
      .setThumbnail("https://www.countryflags.io/np/shiny/64.png")
      .addFields(
        { name: "🤒 Cases", value: "13564" },
        { name: "💀 Deaths", value: "29" }
      )
      .addFields(
        { name: "😄 Recovered", value: "3194", inline: true },
        { name: "🧪 Unresolved", value: "0", inline: true },
        { name: "💉 Serious Case", value: "0", inline: true }
      )
      .addFields(
        { name: "😷 New Cases", value: "0", inline: true },
        { name: "🩸 New Death", value: "0", inline: true },
        { name: "🩺 Active Cases", value: "29", inline: true }
      )
      .setTimestamp()
      .setFooter(
        "TheVirusTracker",
        "https://thevirustracker.com/images/virus1600.png"
      );

    return msg.reply(exampleEmbed);
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
    new Discord.MessageEmbed()
      .setColor("#8a0303")
      // .setTitle(`Total Cases in ${response.info.title}`)
      .setTitle(
        `${
          !isGlobal
            ? `Total Cases in ${response.info.title}`
            : "Total Global Cases"
        }`
      )
      .setURL("https://thevirustracker.com/")
      .setAuthor("Corona Bot", "https://i.ibb.co/mN7xvrX/virus.png")
      .setThumbnail(
        `${
          !isGlobal
            ? `https://www.countryflags.io/${response.info.code}/shiny/64.png`
            : "https://hotemoji.com/images/dl/l/world-emoji-by-google.png"
        }`
      )
      .addFields(
        { name: "🤒 Cases", value: `${response.total_cases}` },
        { name: "💀 Deaths", value: `${response.total_deaths}` }
      )
      .addFields(
        {
          name: "😄 Recovered",
          value: `${response.total_recovered}`,
          inline: true,
        },
        {
          name: "🧪 Unresolved",
          value: `${response.total_unresolved}`,
          inline: true,
        },
        {
          name: "💉 Serious Case",
          value: `${response.total_serious_cases}`,
          inline: true,
        }
      )
      .addFields(
        {
          name: "😷 New Cases",
          value: `${response.total_new_cases_today}`,
          inline: true,
        },
        {
          name: "🩸 New Death",
          value: `${response.total_new_deaths_today}`,
          inline: true,
        },
        {
          name: "🧬 Active Cases",
          value: `${response.total_active_cases}`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter(
        "TheVirusTracker",
        "https://thevirustracker.com/images/virus1600.png"
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
