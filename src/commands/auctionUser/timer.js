const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const { ChannelType } = require("discord.js");
const confirmEmbed = require("../../helper/confirmEmbed.js");
const auctionModel = require("../../models/auctionSchema.js");
class CreateCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("timer")
          .setDescription("See the time left for an auction")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1131164028144734239"] }
    );
  }
  async chatInputRun(interaction) {
    const bidchannel = interaction.options.getChannel("bidchannel");

    const auctionData = await auctionModel.findOne({
      channelID: bidchannel.id,
      active: true,
    });
    if (!auctionData) {
      interaction.reply({
        content: "That isn't an active auction channel!",
        ephemeral: true,
      });
      return;
    }
    if (!auctionData.bids[0]) {
      interaction.reply({
        content: "There are no bids on this auction yet",
        ephemeral: true,
      });
      return;
    }
    const bidDate = new Date(auctionData.bids[0].bidTime);
    interaction.reply({
      content: `End of auction at <t:${Math.floor(
        (bidDate.getTime() + 18 * 60 * 60 * 1000) / 1000
      )}>`,
    });
  }
}

module.exports = {
  CreateCommand,
};
