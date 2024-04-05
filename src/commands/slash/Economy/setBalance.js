const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('setbalance')
        .setDescription('Set an amount of Moonshard to a user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User whose balance to set')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount of Moonshard to set to')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')
        const user = interaction.options.getUser('user').username;
        const amount = interaction.options.getNumber('amount');

        let economy = await EconomySchema.findOne({
            guild: interaction.guildId,
            user: user
        })

        if (!economy) {
            interaction.reply({
                content: 'This user needs to create an economy account first. Use ```/economy create``` to create an economy account.'
            })
            return
        }

        if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {

            if (amount < 0) {
                interaction.reply({
                    content: 'The amount can\'t be less than 0.'
                })
                return;
            }

            await EconomySchema.find({
                guild: interaction.guildId,
                user: user
            }).updateOne({
                balance: amount
            })

            let embed = new EmbedBuilder()
                .setTitle(`Set ${user}'s Moonshard!`)
                .setDescription(`Successfully set ${user}'s Moonshard ${Moonshard} to ${amount}!`)
                .setFooter({ text: 'Set Balance' })
                .setColor('White')

            interaction.reply({
                embeds: [embed]
            })
        } else {
            await interaction.reply({
                content: 'You don\'t have permission to do that.'
            })
        }
    }
};
