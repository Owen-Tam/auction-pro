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
          .setName("bid")
          .setDescription("Bid on an active auction")
          .addChannelOption((option) =>
            option
              .setName("bidchannel")
              .setDescription("Channel of the auction")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("bidamt")
              .setDescription(
                "Amount that you want to bid on the auction in rbx"
              )
              .setRequired(true)
          ),
      { idHints: ["1124926866223009882"] }
    );
  }
  async chatInputRun(interaction) {
    const bidchannel = interaction.options.getChannel("bidchannel");
    const bidamt = interaction.options.getInteger("bidamt");

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
    const highestBid = auctionData.bids[0]?.bidamt
      ? auctionData.bids[0].bidamt
      : auctionData.baseBid;

    const validateBid = (num) => {
      if (
        num < highestBid ||
        num - highestBid < auctionData.minBid ||
        num >= highestBid * 2
      )
        return false;
      if (highestBid) {
        if (num > highestBid) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };
    if (validateBid(bidamt)) {
      try {
        await confirmEmbed(
          `Are you sure to bid ${bidamt} <:Rbx:1093573546422309004> on the ${
            auctionData.auctionName
          }? ${
            highestBid
              ? `It is ${
                  bidamt - highestBid
                } <:Rbx:1093573546422309004> more than the current highest bid.`
              : ""
          } `,
          interaction
        );
        const bidObj = {
          bidUserID: interaction.user.id.toString(),
          bidamt: bidamt,
          bidTime: new Date().toISOString(),
        };
        auctionData.bids.unshift(bidObj);
        auctionData.save();
        interaction.editReply({
          content: `Successful bid! You bidded ${bidamt} <:Rbx:1093573546422309004> on ${auctionData.auctionName}`,
          embeds: [],
          components: [],
        });
        const bidEmbed = {
          color: 0x0099ff,
          title: `New Highest Bid!`,
          description: `<@${interaction.user.id}> has bid ${bidamt} <:Rbx:1093573546422309004> on this auction!`,
        };
        bidchannel.send({ embeds: [bidEmbed] });
      } catch (err) {
        interaction.editReply(`Bid stopped`);
        throw new Error(err);
      }
    } else {
      interaction.reply({
        content: `Invalid bid! Bid amount has to be between ${
          highestBid + auctionData.minBid
        } and ${highestBid * 2} inclusively!`,
        ephemeral: true,
      });
    }
  }
}

module.exports = {
  CreateCommand,
};
