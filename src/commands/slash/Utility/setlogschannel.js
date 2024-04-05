const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setlogschannel')
        .setDescription('Sets a channel to send logs to.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Log channel')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        if (interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const channel = interaction.options.get('channel').value;

            await interaction.deferReply()

            if (!channel) {
                interaction.editReply({
                    content: 'Please select a valid channel.'
                })
            }

            try {
                let data = await GuildSchema.findOne({ guild: interaction.guildId });

                if (!data) data = new GuildSchema({
                    guild: interaction.guildId
                });

                data.logChannel = channel;

                data.save();

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`log channel has been set to <#${channel}>.`)
                            .setFooter({ text: 'Set log channel' })
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
