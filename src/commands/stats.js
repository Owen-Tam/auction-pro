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
          .setName("stats")
          .setDescription("See the stats of an auction")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          ),
      { idHints: ["1126869097385300029"] }
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
    const {
      auctionName,
      channelID,
      createdTime,
      baseBid,
      minBid,
      permID,
      bids,
    } = auctionData;
    const highestBidObj = auctionData.bids[0]
      ? auctionData.bids[0]
      : {
          bidUserID: null,
          bidamt: baseBid,
        };
    const { bidUserID, bidamt } = highestBidObj;
    const auctionEmbed = {
      color: 0x0099ff,

      title: `Auction info for ${auctionName}`,
      description: `Product: ${auctionName} <@&${permID}>\nHighest bidder: ${
        bidUserID ? `<@${bidUserID}>` : "No bets yet"
      }\nHighest bid: ${bidamt} <:Rbx:1093573546422309004> (+ ${
        ((bidamt - baseBid) / baseBid) * 100
      }%)\nNumber of bids: ${bids.length}`,
    };

    interaction.reply({ embeds: [auctionEmbed] });
  }
}

module.exports = {
  CreateCommand,
};
