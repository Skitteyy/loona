const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Gives information about this server.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.guild.name}`)
                    .setThumbnail(interaction.guild.iconURL(
                        { size: 256 }
                    ))
                    .addFields(
                        { name: 'Owner', value: `<@${interaction.guild.ownerId}>`},
                        { name: 'Created on', value: `${interaction.guild.createdAt.toDateString()}`},
                        { name: 'Members', value: `${interaction.guild.memberCount}`},
                        { name: 'Server ID', value: `${interaction.guild.id}`},
                        { name: 'Channels', value: `${interaction.guild.channels.cache.size}`}
                    )
                    .setFooter({ text: 'Server Information'})
                    .setTimestamp()
                    .setColor('White')
            ]
        })
    }
};
