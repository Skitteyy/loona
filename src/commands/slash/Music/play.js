const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds a song to the queue to be played.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song to add')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const query = interaction.options.getString('query');
        const player = client.distube;
    
        try {
            await interaction.deferReply();
    
            await player.play(interaction.member.voice.channel, query);
    
            if (!interaction.member.voice.channel) {
                await interaction.editReply({
                    content: 'You are not in a voice channel.'
                });
                return;
            }
    
            const queue = player.getQueue(interaction.guildId);
            const added = queue.songs[queue.songs.length - 1];
    
            if (!queue) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Music Player')
                            .setDescription(`Playing **${added.name}**.`)
                            .setFooter({ text: 'Song playing' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                });
                return;
            }

            if (query.startsWith('https://open.spotify.com/album/')) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Music Player')
                            .setDescription(`Album added to queue.`)
                            .setFooter({ text: 'Album playing' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })
                return;
            }
    
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(queue && queue.playing ? 'Song added to Queue' : 'Music Player')
                        .setDescription(queue && queue.playing ? `**${added.name}** added to the queue.` : `Playing **${added.name}**.`)
                        .setFooter({ text: queue && queue.playing ? 'Song added' : 'Song playing' })
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
