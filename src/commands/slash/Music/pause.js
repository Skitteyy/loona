const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause and unpause the player.'),
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
                if (queue.playing) {
                    await player.pause(interaction.guildId);
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Music Player')
                                .setDescription(`The player has been paused`)
                                .setFooter({ text: 'Paused' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });
                } else {
                    await player.resume(interaction.guildId);
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Music Player')
                                .setDescription(`The player has been unpaused`)
                                .setFooter({ text: 'Unpaused' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });
                }
            } else return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Music Player')
                        .setDescription(`There is no song to pause.`)
                        .setFooter({ text: 'Pause' })
                        .setTimestamp()
                        .setColor('White')
                ]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred.' });
        }
    }
};
