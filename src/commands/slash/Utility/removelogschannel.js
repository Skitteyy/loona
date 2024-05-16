const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('unsetlogschannel')
        .setDescription('Unsets logs channel.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        if (interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.deferReply()

            try {
                await GuildSchema.findOne({
                    guild: interaction.guildId
                }).updateOne({
                    logChannel: 'none'
                })

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`log channel has been unset.`)
                            .setFooter({ text: 'Unset log channel' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })

            } catch (error) {
                console.log(error)
            }
        }
        else
            await interaction.reply({
                content: 'You don\'t have permission to do that.'
            })

    }
};
