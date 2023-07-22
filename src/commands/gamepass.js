const { Command } = require("@sapphire/framework");
const roblox = require("noblox.js");

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const gamepass = require("../noblox/gamepass.js");
class PingCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("gamepass")
          .setDescription("Issue a gamepass")
          .addIntegerOption((option) =>
            option
              .setName("amount")
              .setDescription("Amount of the gamepass")
              .setRequired(true)
          ),
      { idHints: ["1131980077169659905"] }
    );
  }
  async chatInputRun(interaction) {
    if (interaction.user.id != "701692611823665183")
      return interaction.reply({
        content: `Only founder of **${bot.user.username}** can use this command.`,
        ephemeral: true,
      });
    const id = gamepass.getGamepass();
    if (!id) return interaction.reply("All gamepasses are in use!");
    const link = "https://www.roblox.com/game-pass/" + id;
    const amount = interaction.options.getInteger("amount");
    roblox.configureGamePass(id, "", "", amount).then(async () => {
      const done = new ButtonBuilder()
        .setCustomId("done")
        .setLabel("Done")
        .setStyle(ButtonStyle.Primary);

      const response = await interaction.reply({
        content: `**Gamepass: ${link} ${amount} R$ (${Math.floor(
          amount * (7 / 10)
        )} R$ after tax)**`,
        components: [new ActionRowBuilder().addComponents(done)],
      });

      const free = await response.awaitMessageComponent({
        filter: (u) => u.user.id == interaction.user.id,
      });
      if (free.customId == "done") {
        gamepass.freeGamepass(id); // remove the usage so it can be used again
        response.edit({
          content: "Purchase done.",
          components: [],
        });
      }
    });
  }
}

module.exports = {
  PingCommand,
};
