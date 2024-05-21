const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('diceroll')
        .setDescription('Roll a 6 sided dice!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId('diceroll_button')
                    .setLabel('Roll again')
                    .setStyle(ButtonStyle.Primary)
            );

        let options = [
            `${message.author.username} rolled a dice, it landed on 1!`,
            `${message.author.username} rolled a dice, it landed on 2!`,
            `${message.author.username} rolled a dice, it landed on 3!`,
            `${message.author.username} rolled a dice, it landed on 4!`,
            `${message.author.username} rolled a dice, it landed on 5!`,
            `${message.author.username} rolled a dice, it landed on 6!`,
        ]

        let answer = options[Math.floor(Math.random() * options.length)];

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.member.user.username} rolls a dice.`)
                    .setDescription(`${answer}`)
                    .setFooter({ text: 'Dice roll' })
                    .setTimestamp()
            ],
            components: [row]
        });

        const filter = i => i.customId === 'coinflip_button' && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter: filter, time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'diceroll_button') {
                let newAnswer = options[Math.floor(Math.random() * options.length)];
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.member.user.username} rolls a dice.`)
                            .setDescription(`${newAnswer}`)
                            .setFooter({ text: 'Dice roll' })
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