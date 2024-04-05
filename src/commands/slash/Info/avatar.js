const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Shows a user\'s avatar.')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('User to get the avatar from')
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
                    .setTitle(`${targetUser.user.username}'s Avatar`)
                    .setImage(targetUser.displayAvatarURL(
                        { size: 1024 }
                    ))
                    .setFooter({ text: 'User Avatar' })
                    .setTimestamp()
                    .setColor('White')
            ]
        })
    }
};
