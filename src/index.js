const { SapphireClient } = require("@sapphire/framework");
const { GatewayIntentBits } = require("discord.js");
const mongoose = require(`mongoose`);

require("dotenv/config");
require("@sapphire/plugin-hmr/register");

const client = new SapphireClient({
  intents: [
    "Guilds",
    "GuildMessages",
    "GuildMessageReactions",
    "MessageContent",
  ],
  defaultCooldown: {
    delay: 1000,
    filteredCommands: [""],
    filteredUsers: ["701692611823665183", "685391998152081412"],
  },
});
mongoose
  .connect(process.env.MONGODBSRV, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Auction Pro is now connected to the database!");
  })
  .catch(err => {
    console.log(err);
  });
client.login(process.env.TOKEN);
