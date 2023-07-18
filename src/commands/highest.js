const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const { ChannelType } = require("discord.js");
const confirmEmbed = require("../helper/confirmEmbed.js");
const auctionModel = require("../models/auctionSchema.js");
class CreateCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("highest")
          .setDescription("See the highest bid")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1126866374644465706"] }
    );
  }
  async chatInputRun(interaction) {
    const bidchannel = interaction.options.getChannel("bidchannel");

    const auctionData = await auctionModel.findOne({
      channelID: bidchannel.id,
    });
    if (!auctionData) {
      interaction.reply({
        content: "That isn't an active auction channel!",
        ephemeral: true,
      });
      return;
    }
    const highestBidObj = auctionData.bids[0];
    interaction.reply(
      `Highest bid is ${highestBidObj.bidamt} <:Rbx:1093573546422309004> by <@${highestBidObj.bidUserID}>`
    );
  }
}

module.exports = {
  CreateCommand,
};
