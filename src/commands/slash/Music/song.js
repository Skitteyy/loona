const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Manage the current song playing.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose an action')
                .addChoices(
                    { name: 'show', value: 'show' },
                    { name: 'next', value: 'next' },
                    { name: 'previous', value: 'previous' }
                )
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const player = client.distube;

        try {
            const queue = player.getQueue(interaction.guildId);

            const storage = queue.previousSongs.map(song => song.url)

            if (!interaction.member.voice.channel) {
                interaction.reply({
                    content: 'You are not in a voice channel.'
                });
                return;
            }

            switch (interaction.options.getString('action')) {
                case 'show': {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Currently Playing`)
                                .setDescription(`**${queue.songs[0].name}**`)
                                .setFooter({ text: 'Current song' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    break;
                }

                case 'next': {
                    if (!queue.songs[1]) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`Currently Playing`)
                                    .setDescription('No song in queue to skip to.')
                                    .setFooter({ text: 'Current song' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        })
                    } else {
                        await player.skip(interaction.guildId).then(interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`Currently Playing`)
                                    .setDescription(`Skipped to next song **${queue.songs[1].name}**`)
                                    .setFooter({ text: 'Current song' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        }));
                    }

                    break;
                }

                case 'previous': {
                    if (storage.length < 1) {
                        interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`Currently Playing`)
                                    .setDescription('No song in queue to return to.')
                                    .setFooter({ text: 'Current song' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        })
                    } else {
                        await player.previous(interaction.guildId).then(interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`Currently Playing`)
                                    .setDescription(`Skipped to previous song **${(await queue.previous()).name}**`)
                                    .setFooter({ text: 'Current song' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        }));
                    }

                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred' });
        }
    }
};
