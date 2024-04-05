const { UserContextMenuCommandInteraction, ContextMenuCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new ContextMenuCommandBuilder()
        .setName('Balance')
        .setType(2),
    /**
     * @param {ExtendedClient} client 
     * @param {UserContextMenuCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')
        const user = interaction.targetUser.username

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