const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music player and leaves the voice channel'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const player = client.distube;

        try {  
            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: 'You are not in a voice channel.'
                });
                return;
            }

            const queue = player.getQueue(interaction.guildId);

            if (queue) {
                await player.stop(interaction.member.voice.channel);

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Stop Music Player')
                            .setDescription('The music player has been stopped.')
                            .setFooter({ text: 'Stop' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                });
            } else {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Stop Music Player')
                            .setDescription('The Music player is not active.')
                            .setFooter({ text: 'Stop' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred.' });
        }
    }
};
