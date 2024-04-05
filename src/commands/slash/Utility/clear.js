const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('deletes up to 100 messages.')
        .addStringOption(option =>
            option.setName('amount')
                .setDescription('Amount of messages to delete')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const amount = Math.floor(interaction.options.get('amount').value) + 1;

            await interaction.deferReply()

            if (isNaN(amount)) {
                await interaction.editReply({
                    content: 'Please put a number as the amount.'
                })
                return;
            }

            if (amount < 1 || amount > 100) {
                await interaction.editReply({
                    content: 'The amount should be a number between 1 and 100.'
                })
                return;
            }

            try {
                interaction.channel.bulkDelete(amount);

                setTimeout(async function () {
                    await interaction.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Success!')
                                .setDescription(`${amount - 1} messages were deleted.`)
                                .setFooter({ text: 'Clear messages' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    })
                }, 5000)
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
