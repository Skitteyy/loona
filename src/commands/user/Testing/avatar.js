const { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new ContextMenuCommandBuilder()
        .setName('Avatar')
        .setType(2),
    /**
     * @param {ExtendedClient} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.targetMember.user.username}'s Avatar`)
                    .setImage(interaction.targetMember.displayAvatarURL(
                        { size: 1024, extension: 'png' }
                    ))
                    .setFooter({ text: 'User Avatar' })
                    .setTimestamp()
            ]
        })
    }
};