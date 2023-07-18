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
          .setName("create")
          .setDescription("Create an auction")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the Auction")
              .setRequired(true)
          )
          .addUserOption((option) =>
            option
              .setName("seller")
              .setDescription("The seller")
              .setRequired(true)
          )
          .addRoleOption((option) =>
            option
              .setName("perms")
              .setDescription("Permission role")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("features")
              .setDescription("Features of the product (separated by commas)")
              .setRequired(true)
          )

          .addIntegerOption((option) =>
            option
              .setName("base")
              .setDescription("Base bid for the auction")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("min")
              .setDescription("Min bid increase for the auction")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("images")
              .setDescription(
                "Image links of the product (Separated by commas)"
              )
          )
          .addRoleOption((option) =>
            option.setName("ping").setDescription("Ping used for the auction")
          ),

      { idHints: ["1118112142462287963"] }
    );
  }
  async chatInputRun(interaction) {
    const name = interaction.options.getString("name");
    const seller = interaction.options.getUser("seller");
    const perms = interaction.options.getRole("perms");
    const features = interaction.options.getString("features");
    const images = interaction.options.getString("images");
    const base = interaction.options.getInteger("base");
    const min = interaction.options.getInteger("min");
    const ping = interaction.options.getRole("ping");

    try {
      await confirmEmbed(
        `Auction By: ${name}\nProduct: ${name} <@&${
          perms.id
        }\nFeatures: ${features
          .split(",")
          .map((feature) => `${feature}`)
          .join(
            "\n"
          )}\nBase Bid: ${base} <:Rbx:1093573546422309004>\nIncreases by at least: ${min} <:Rbx:1093573546422309004>`,
        interaction
      );
    } catch (err) {
      interaction.editReply(`Auction creation stopped`);
      throw new Error(err);
    }
    const channel = await interaction.guild.channels.create({
      name: `${name}`,
      type: ChannelType.GuildText,
    });
    channel.setParent("1124962128680472586");
    const auctionEmbed = {
      color: 0x0099ff,
      title: `${name}`,
      fields: [
        { name: "Auction by", value: `<@${seller.id}>`, inline: true },
        { name: "Product", value: `${name} <@&${perms.id}>`, inline: true },
        {
          name: "Features",
          value: `${features
            .split(",")
            .map((feature) => `${feature}`)
            .join("\n")}`,
        },
        {
          name: "Bid Info",
          value: `Base Bid: ${base} <:Rbx:1093573546422309004>\nIncreases by at least: ${min} <:Rbx:1093573546422309004>`,
        },
      ],
    };
    const thread = await channel.threads.create({
      name: "auction-chat",
      reason: "New auction thread",
    });
    await channel.send({ embeds: [auctionEmbed] });
    thread.send(`You may chat here!`);
    // TODO Validation
    if (images)
      images.split(",").forEach((img) => {
        channel.send(img);
      });
    if (ping) {
      if (ping.name === "@everyone") channel.send(ping.name);
      else channel.send(`<@&${ping.id}>`);
    }
    const auction = await auctionModel.create({
      channelID: channel.id,
      createdTime: new Date().toISOString(),
      auctionName: name,
      baseBid: base,
      minBid: min,
      bids: [],
      permID: perms.id,
    });
    auction.save();
    interaction.editReply({
      content: "Auction created!",
      components: [],
      embeds: [],
    });
  }
}

module.exports = {
  CreateCommand,
};
