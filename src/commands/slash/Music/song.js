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
                    { name: 'previous', value: 'previous'}
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

                    interaction.reply({
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
                    const queue = player.getQueue(interaction.guildId);
                    if (!queue || !queue.songs.length) return interaction.reply({ content: 'The queue is empty.' });
                    
                    if (queue._next === false) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Currently Playing`)
                                .setDescription(`No song to skip to in the queue.`)
                                .setFooter({ text: 'Current song' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    player.skip(interaction.guildId);

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Currently Playing`)
                                .setDescription(`Skipped to next song **${(await queue.skip()).name}**`)
                                .setFooter({ text: 'Current song' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    break;
                }

                case 'previous': {
                    const queue = player.getQueue(interaction.guildId);
                    if (!queue || !queue.songs.length) return interaction.reply({ content: 'The queue is empty.' });
                    
                    if (queue._prev === false) return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Currently Playing`)
                                .setDescription(`No song to return to in the queue.`)
                                .setFooter({ text: 'Current song' })
                                .setTimestamp()
                                .setColor('White')
                        ]
                    });

                    player.previous(interaction.guildId);
                    
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Currently Playing`)
                                .setDescription(`Skipped to previous song **${(await queue.previous()).name}**`)
                                .setFooter({ text: 'Current song' })
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
