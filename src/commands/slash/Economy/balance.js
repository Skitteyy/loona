const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Message } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('View a user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User whose balance to view')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')
        const user = interaction.options.getUser('user').username;

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

        if (!economy.balance) {
            let embed = new EmbedBuilder()
                .setTitle(`${user}'s Balance`)
                .setDescription(`${user} doesn't have any Moonshard ${Moonshard}!`)
                .setFooter({ text: 'Balance' })
                .setColor('White')

            interaction.reply({
                embeds: [embed]
            })
        } else {
            let embed = new EmbedBuilder()
                .setTitle(`${user}'s Balance`)
                .setDescription(`${user} has ${economy.balance} Moonshard ${Moonshard}!`)
                .setFooter({ text: 'Balance' })
                .setColor('White')

            interaction.reply({
                embeds: [embed]
            })
        }
    }
};
