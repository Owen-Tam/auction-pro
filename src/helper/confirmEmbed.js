const {
  Discord,
  ButtonBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

function sendConfirmationEmbed(description, interaction) {
  return new Promise((resolve, reject) => {
    const embed = new EmbedBuilder()
      .setTitle("Confirm action?")
      .setDescription(description)
      .setColor("#0099ff");

    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );
    interaction
      .reply({
        embeds: [embed],
        components: [actionRow],
        fetchReply: true,
      })
      .then(message => {
        const filter = button =>
          button.user.id === interaction.user.id &&
          (button.customId === "confirm" || button.customId === "cancel");

        const collector = message.createMessageComponentCollector({
          filter,
          max: 1,
          time: 20000,
        });

        collector.on("collect", button => {
          if (button.customId === "confirm") {
            resolve();
          } else {
            reject();
          }
        });

        collector.on("end", () => {
          reject();
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}
module.exports = sendConfirmationEmbed;
