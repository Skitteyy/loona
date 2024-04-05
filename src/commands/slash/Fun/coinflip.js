const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const row = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId('coinflip_button')
                    .setLabel('Flip again')
                    .setStyle(ButtonStyle.Primary)
            );

        let options = [
            `${interaction.member.user.username} flipped a coin, the coin landed on **Heads**!`,
            `${interaction.member.user.username} flipped a coin, the coin landed on **Tails**!`
        ]

        let answer = options[Math.floor(Math.random() * options.length)];

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Coin flip')
                    .setDescription(`${answer}`)
                    .setFooter({ text: 'Coin flip' })
                    .setTimestamp()
            ],
            components: [ row ]
        });

        const collector = interaction.channel.createMessageComponentCollector();

        collector.on('collect', async interaction => {
            if (interaction.customId === 'coinflip_button') {
                let newAnswer = options[Math.floor(Math.random() * options.length)];
                await interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Coin flip')
                            .setDescription(`${newAnswer}`)
                            .setFooter({ text: 'Coin flip' })
                            .setTimestamp()
                    ],
                    components: [ row ]
                });
            }
        })
    }
};
