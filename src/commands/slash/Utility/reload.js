const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all slash commands.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        try {
            if (interaction.member.id !== '821681414947733504') return interaction.reply({ content: 'You can\'t do that.' });
            console.log(`[${new Date().toLocaleString()}] Reloading commands...`);

            require('../../../handlers/commands')(client);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Reload Commands')
                        .setDescription('All commands have been reloaded.')
                        .setColor('Green')
                ],
            });
        } catch (error) {
            console.error('Error reloading commands:', error);
            await interaction.reply({
                content: 'An error occurred while reloading commands.',
            });
        }
    }
};
