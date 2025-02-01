const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('levels')
        .setDescription('Manage the leveling functionality.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose an action')
                .addChoices(
                    { name: 'enable', value: 'enable' },
                    { name: 'disable', value: 'disable' }
                )
                .setRequired(true)
        ),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        let guildData = await GuildSchema.findOne({
            guild: interaction.guildId,
        });

        if (!guildData) {
            guildData = new GuildSchema({
                guild: interaction.guildId,
                leveling: 'disabled'
            });

            await guildData.save();
        }

        switch (interaction.options.getString('action')) {
            case 'enable': {
                if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    if (guildData.leveling === 'enabled') {
                        interaction.reply({
                            content: 'Leveling is already enabled.'
                        });

                        return;
                    } else {
                        guildData.leveling = 'enabled';
                        await guildData.save();

                        interaction.reply({
                            content: 'Leveling has been enabled.'
                        });

                        return;
                    }
                } else {
                    await interaction.reply({
                        content: 'You don\'t have permission to do that.'
                    });
                }

                break;
            }

            case 'disable': {
                if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    if (guildData.leveling === 'disabled') {
                        interaction.reply({
                            content: 'Leveling is already disabled.'
                        });

                        return;
                    } else {
                        guildData.leveling = 'disabled';
                        await guildData.save();

                        interaction.reply({
                            content: 'Leveling has been disabled.'
                        });

                        return;
                    }
                } else {
                    await interaction.reply({
                        content: 'You don\'t have permission to do that.'
                    });
                }

                break;
            }
        }
    }
};
