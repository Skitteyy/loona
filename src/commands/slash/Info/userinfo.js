const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Gives information about a user.')
        .addMentionableOption( option =>
            option.setName('user')
            .setDescription('User to get information about')
            .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const user = interaction.options.get('user').value;

        const targetUser = await interaction.guild.members.fetch(user);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${targetUser.user.username}`)
                    .setThumbnail(targetUser.displayAvatarURL(
                        { size: 256 }
                    ))
                    .addFields(
                        { name: 'Joined Discord on', value: `${targetUser.user.createdAt.toDateString()}`},
                        { name: `Joined ${interaction.guild.name} on`, value: `${targetUser.joinedAt.toDateString()}`},
                        { name: 'User ID', value: `${targetUser.id}`},
                        { name: `Roles [${targetUser.roles.cache.size}]`, value: `${targetUser.roles.cache.map(role => role).join(", ")}`},
                    )
                    .setFooter({ text: 'User Information' })
                    .setTimestamp()
                    .setColor('White')
            ]
        })
    }
};
