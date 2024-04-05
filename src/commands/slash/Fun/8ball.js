const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8ball a question!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('8ball question')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        let options = [
                //positive answers
                'It is certain.',
                'It is decidedly so.',
                'Without a doubt.',
                'Yes definitely.',
                'You may rely on it.',
                'As I see it, yes.',
                'Most likely.',
                'Outlook good.',
                'Yes.',
                'Signs point to yes.',
                //non committal answers
                'Reply hazy, try again.',
                'Ask again later.',
                'Better not tell you now.',
                'Cannot predict now.',
                'Concentrate and ask again.',
                //negative answers
                'Do not count on it.',
                'My reply is no.',
                'My sources say no.',
                'Outlook not so good.',
                'Very doubtful.'
        ];

        let answer = options[Math.floor(Math.random() * options.length)];

        const question = interaction.options.get('question').value;

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.member.user.username} asks the magic 8ball...`)
                    .addFields(
                        { name: `${question}`, value: `${answer}`}
                    )
                    .setFooter({ text: '8ball' })
                    .setTimestamp()
            ],
        });
    }
};
