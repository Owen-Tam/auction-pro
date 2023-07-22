const { Command } = require("@sapphire/framework");
const { isMessageInstance } = require("@sapphire/discord.js-utilities");
const { ChannelType } = require("discord.js");
const confirmEmbed = require("../../helper/confirmEmbed.js");
const auctionModel = require("../../models/auctionSchema.js");
class RemoveHighestCommand extends Command {
  constructor(context, options) {
    super(context, { preconditions: ["StaffOnly"] });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("removehighest")
          .setDescription("Remove the highest bid")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1130831838223540294"] }
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
    if (auctionData.bids.length === 0) {
      interaction.reply({
        content: "There are no valid bids on the auction",
        ephemeral: true,
      });
      return;
    }
    try {
      console.log(auctionData.bids);
      await confirmEmbed(
        `Are you sure to remove the highest bid on ${
          auctionData.auctionName
        }?\n${
          auctionData.bids[1]
            ? `The new highest bid will be ${auctionData.bids[1].bidamt} by <@${auctionData.bids[1].bidUserID}>`
            : `There will be no bids left`
        }`,
        interaction
      );
      auctionData.bids.shift();
      auctionData.save();

      const bidEmbed = {
        color: 0x0099ff,
      };
      if (!auctionData.bids[0]) {
        bidEmbed.title = "Highest Bid Removed";
        bidEmbed.description = "There are now no bids on this auction";
      } else {
        const newHighest = auctionData.bids[0];
        bidEmbed.title = `Highest Bid Modified!`;
        bidEmbed.description = `<@${newHighest.bidUserID}>'s bid of ${newHighest.bidamt} <:Rbx:1093573546422309004> on this auction is now the highest!`;
      }

      bidchannel.send({ embeds: [bidEmbed] });

      interaction.editReply({
        content: `Successfully removed highest bid`,
        embeds: [],
        components: [],
      });
    } catch (err) {
      interaction.editReply({
        content: `Removal of highest bid stopped`,
        embeds: [],
        components: [],
      });
      throw new Error(err);
    }
  }
}

module.exports = {
  RemoveHighestCommand,
};
