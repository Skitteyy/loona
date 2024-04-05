const { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new ContextMenuCommandBuilder()
        .setName('User')
        .setType(2),
    /**
     * @param {ExtendedClient} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.targetMember.user.username}`)
                    .setThumbnail(interaction.targetMember.displayAvatarURL(
                        { size: 256, extension: 'png'}
                    ))
                    .addFields(
                        { name: 'Joined Discord on', value: `${interaction.targetMember.user.createdAt.toDateString()}`},
                        { name: `Joined ${interaction.guild.name} on`, value: `${interaction.targetMember.joinedAt.toDateString()}`},
                        { name: 'User ID', value: `${interaction.targetMember.id}`},
                        { name: `Roles [${interaction.targetMember.roles.cache.size}]`, value: `${interaction.targetMember.roles.cache.map(role => role).join(", ")}`},
                    )
                    .setFooter({ text: 'User Information'})
                    .setTimestamp()
            ]
        })
    }
};