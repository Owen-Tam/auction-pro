const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const confirmEmbed = require("../../helper/confirmEmbed.js");
const auctionModel = require("../../models/auctionSchema.js");
class EndCommand extends Command {
  constructor(context, options) {
    super(context, { preconditions: ["StaffOnly"] });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("end")
          .setDescription("End an auction")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1131251851803754546"] }
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

    try {
      await confirmEmbed(
        `Are you sure to end the auction on ${auctionData.auctionName}?\n
        ${
          auctionData.bids[0]
            ? `The winner will be ${auctionData.bids[0].bidamt} by <@${auctionData.bids[0].bidUserID}>`
            : `There will be no winner`
        }`,
        interaction
      );
      auctionData.active = false;
      const thread = bidchannel.threads.cache.find(
        (x) => x.name === "auction-chat"
      );
      await thread.setLocked(true);
      auctionData.save();
      const embed = {
        title: `The Auction for ${auctionData.auctionName} <@&${auctionData.permID}> has ended!`,
        description: `${
          auctionData.bids[0]
            ? `Winner is <@${auctionData.bids[0].bidUserID}> with ${auctionData.bids[0].bidamt}!`
            : `There was no valid winner`
        }`,
      };
      bidchannel.send({ embeds: [embed] });

      interaction.editReply({
        content: `Successfully ended the auction and locked the thread.`,
        embeds: [],
        components: [],
      });
    } catch (err) {
      interaction.editReply({
        content: `Ending of auction stopped`,
        embeds: [],
        components: [],
      });
      throw new Error(err);
    }
  }
}

module.exports = {
  EndCommand,
};
