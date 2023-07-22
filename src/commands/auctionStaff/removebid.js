const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const { ChannelType } = require("discord.js");
const confirmEmbed = require("../../helper/confirmEmbed.js");
const auctionModel = require("../../models/auctionSchema.js");
class RemoveBidCommand extends Command {
  constructor(context, options) {
    super(context, { preconditions: ["StaffOnly"] });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("removebid")
          .setDescription("Remove N bids")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("amt")
              .setDescription("Number of bids to remove")
              .setRequired(true)
          ),
      { idHints: ["1131145501924925521"] }
    );
  }
  async chatInputRun(interaction) {
    const bidchannel = interaction.options.getChannel("bidchannel");
    const amt = interaction.options.getInteger("amt");
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
    if (auctionData.bids.length === 0) {
      interaction.reply({
        content: "There are no valid bids on the auction",
        ephemeral: true,
      });
      return;
    } else if (auctionData.bids.length < amt) {
      interaction.reply({
        content: `There are only ${auctionData.bids.length} bids on this auction. You cannot remove ${amt} bids.`,
      });
    }
    try {
      await confirmEmbed(
        `Are you sure to remove ${amt} highest bids on ${
          auctionData.auctionName
        }?\n
        ${
          auctionData.bids[amt]
            ? `The new highest bid will be ${auctionData.bids[amt].bidamt} by <@${auctionData.bids[amt].bidUserID}>`
            : `There will be no bids left`
        }`,
        interaction
      );
      for (let i = 0; i < amt; i++) {
        auctionData.bids.shift();
      }
      auctionData.save();

      const bidEmbed = {
        color: 0x0099ff,
      };
      if (!auctionData.bids[0]) {
        bidEmbed.title = "Bids Removed";
        bidEmbed.description = "There are now no bids on this auction";
      } else {
        const newHighest = auctionData.bids[0];
        bidEmbed.title = `Highest Bid Modified!`;
        bidEmbed.description = `<@${newHighest.bidUserID}>'s bid of ${newHighest.bidamt} <:Rbx:1093573546422309004> on this auction is now the highest!`;
      }

      bidchannel.send({ embeds: [bidEmbed] });

      interaction.editReply({
        content: `Successfully removed ${amt} bids`,
        embeds: [],
        components: [],
      });
    } catch (err) {
      interaction.editReply({
        content: `Removal of ${amt} bid stopped`,
        embeds: [],
        components: [],
      });
      throw new Error(err);
    }
  }
}

module.exports = {
  RemoveBidCommand,
};
