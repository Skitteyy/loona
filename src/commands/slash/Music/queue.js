const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ComponentType, ButtonBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Manage the music player queue.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose an action')
                .addChoices(
                    { name: 'show', value: 'show' },
                    { name: 'clear', value: 'clear' },
                    { name: 'remove', value: 'remove'}
                )
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('number')
            .setDescription('Song number to remove')
            .setRequired(false)),
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
            
            switch (interaction.options.getString('action')) {
                case 'show': {
                    const queue = player.getQueue(interaction.guildId);
                    if (!queue || !queue.songs.length) return interaction.reply({ content: 'The queue is empty.' });

                    let currentPage = 0;
                    const songsPerPage = 10;
                    const totalPages = Math.ceil(queue.songs.length / songsPerPage);

                    const generateEmbed = (page) => {
                        const start = page * songsPerPage;
                        const end = start + songsPerPage;
                        const currentSongs = queue.songs.slice(start, end);
                        const queueList = currentSongs.map((song, index) => `**${start + index + 1}.** ${song.name}`).join('\n');

                        return new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} Queue`)
                            .setDescription(queueList)
                            .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
                            .setTimestamp()
                            .setColor('White');
                    };

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle(1)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(1)
                            .setDisabled(currentPage === totalPages - 1)
                    );

                    await interaction.reply({
                        embeds: [generateEmbed(currentPage)],
                        components: [row]
                    });

                    const filter = i => i.customId === 'previous' || i.customId === 'next';
                    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'previous') {
                            currentPage--;
                        } else if (i.customId === 'next') {
                            currentPage++;
                        }

                        await i.update({
                            embeds: [generateEmbed(currentPage)],
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('previous')
                                        .setLabel('Previous')
                                        .setStyle(1)
                                        .setDisabled(currentPage === 0),
                                    new ButtonBuilder()
                                        .setCustomId('next')
                                        .setLabel('Next')
                                        .setStyle(1)
                                        .setDisabled(currentPage === totalPages - 1)
                                )
                            ]
                        });
                    });

                    collector.on('end', () => {
                        row.components[0].setDisabled(true);
                        row.components[1].setDisabled(true);
                        interaction.editReply({ components: [row] });
                    })

                    break;
                }

                case 'clear': {
                    const queue = player.getQueue(interaction.guildId);

                    queue.remove(interaction.guildId);

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} Queue`)
                                .setDescription(`The queue has been cleared.`)
                                .setFooter({ text: 'Queue' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    break;
                }

                case 'remove': {
                    const songNumber = interaction.options.getInteger('number');
                    if (songNumber === undefined || songNumber < 1) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} Queue`)
                                    .setDescription(`Please enter a valid song number`)
                                    .setFooter({ text: 'Queue' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        });
                    }

                    const queue = player.getQueue(interaction.guildId);
                    if (!queue || !queue.songs.length) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} Queue`)
                                    .setDescription(`The queue is empty`)
                                    .setFooter({ text: 'Queue' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        });
                    }

                    if (songNumber > queue.songs.length) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} Queue`)
                                    .setDescription(`There are only ${queue.songs.length} songs in the queue. Please enter a valid song number.`)
                                    .setFooter({ text: 'Queue' })
                                    .setTimestamp()
                                    .setColor('White')
                            ]
                        });
                    }

                    const removedSong = queue.songs.splice(songNumber - 1, 1)[0];
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} Queue`)
                                .setDescription(`Removed **${removedSong.name}** from the queue.`)
                                .setFooter({ text: 'Queue' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred' });
        }
    }
};