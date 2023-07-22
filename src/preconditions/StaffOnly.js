const { Precondition } = require("@sapphire/framework");

class StaffOnlyPrecondition extends Precondition {
  async chatInputRun(interaction) {
    // for Slash Commands
    return this.checkStaff(interaction.user.id, interaction.guild);
  }
  async checkStaff(userId, guild) {
    const member = guild.members.cache.get(userId);
    return member.roles.cache.has("1115948899253882933")
      ? this.ok()
      : this.error({ message: "You can't do this command!" });
  }
}

module.exports = {
  StaffOnlyPrecondition,
};
