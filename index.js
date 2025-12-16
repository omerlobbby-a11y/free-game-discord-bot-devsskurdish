import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import cron from "cron";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const WEBSITE = "https://devsskurdish.online";

async function getFreeGames() {
  const res = await fetch("https://www.gamerpower.com/api/giveaways");
  return res.json();
}

async function sendGame(game) {
  const platform = game.platform.toLowerCase();
  const isSteam = platform.includes("steam");

  const embed = new EmbedBuilder()
    .setColor(isSteam ? 0x1b2838 : 0x2f2f2f)
    .setTitle(game.title)
    .setURL(game.open_giveaway_url)
    .setThumbnail(
      isSteam
        ? "https://upload.wikimedia.org/wikipedia/commons/3/3a/Steam_icon_logo.svg"
        : "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg"
    )
    .setImage(game.thumbnail)
    .addFields(
      { name: "💰 نرخ", value: "~~" + game.worth + "~~ ➜ FREE", inline: true },
      { name: "⏳ کۆتایی", value: game.end_date, inline: true },
      { name: "🖥 پلاتفۆرم", value: game.platform, inline: true }
    )
    .setFooter({ text: "website | کلیک لێ بکە" });

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  await channel.send({
    content: "@everyone",
    embeds: [embed],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "🌐 website | کلیک لێ بکە",
            url: WEBSITE
          }
        ]
      }
    ]
  });
}

const job = new cron.CronJob("0 */6 * * *", async () => {
  const games = await getFreeGames();
  for (const game of games) {
    await sendGame(game);
  }
});

client.once("ready", () => {
  console.log("Bot is online!");
  job.start();
});

client.login(process.env.BOT_TOKEN);
