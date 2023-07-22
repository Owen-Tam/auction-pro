const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const confirmEmbed = require("../../helper/confirmEmbed.js");
const auctionModel = require("../../models/auctionSchema.js");
class DeleteCommand extends Command {
  constructor(context, options) {
    super(context, { preconditions: ["StaffOnly"] });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("delete")
          .setDescription("Delete an auction")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1131161352887607387"] }
    );
  }
  async chatInputRun(interaction) {
    const bidchannel = interaction.options.getChannel("bidchannel");

    const auctionData = await auctionModel.findOne({
      channelID: bidchannel.id,
      active: false,
    });
    if (!auctionData) {
      interaction.reply({
        content:
          "That isn't an inactive auction channel! It must be an ended auction.",
        ephemeral: true,
      });
      return;
    }

    try {
      await confirmEmbed(
        `Are you sure to delete the auction on ${auctionData.auctionName}?`,
        interaction
      );
      await auctionModel.deleteOne({ channelID: bidchannel.id });
      await bidchannel.delete();

      interaction.editReply({
        content: `Successfully deleted the auction`,
        embeds: [],
        components: [],
      });
    } catch (err) {
      interaction.editReply({
        content: `Deletion of auction stopped`,
        embeds: [],
        components: [],
      });
      throw new Error(err);
    }
  }
}

module.exports = {
  DeleteCommand,
};
