const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('russianroulette')
        .setDescription('A magazine of 6, one bullet is loaded. Good luck.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId('russianroulette_button')
                    .setLabel('Pull trigger again')
                    .setStyle(ButtonStyle.Primary)
            );

        let options = [
            '*click* nothing happened',
            '*click* nothing happened',
            '*click* nothing happened',
            '*click* nothing happened',
            '*click* nothing happened',
            '*peng* youre dead, congrats'
        ]

        let answer = options[Math.floor(Math.random() * options.length)];

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.member.user.username} is feeling suicidal.`)
                    .setDescription(`${answer}`)
                    .setFooter({ text: 'Russian roulette' })
                    .setTimestamp()
            ],
            components: [row]
        });

        const filter = i => i.customId === 'coinflip_button' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter: filter, time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'russianroulette_button') {
                let newAnswer = options[Math.floor(Math.random() * options.length)];
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.member.user.username} is feeling suicidal.`)
                            .setDescription(`${newAnswer}`)
                            .setFooter({ text: 'Russian roulette' })
                            .setTimestamp()
                    ],
                    components: [row]
                });
            }
        })

        collector.on('end', () => {
            row.components[0].setDisabled(true);
            interaction.editReply({ components: [row] });
        })
    }
};
