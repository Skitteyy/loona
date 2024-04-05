const { ChatInputCommandInteraction, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all the possible commands!')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('choose a category')
                .addChoices(
                    { name: 'slash', value: 'slash' },
                    { name: 'prefix', value: 'prefix' },
                    { name: 'nsfw', value: 'nsfw' }
                )
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        await interaction.deferReply();

        switch (interaction.options.getString('category')) {
            case 'slash': {
                const mapIntCmds = client.applicationcommandsArray
                    .filter(command => !command.nsfw)
                    .map((v) => `\`/${v.name}\`: ${v.description}`);

                const maxPerPage = 10;
                const totalPages = Math.ceil((mapIntCmds.length) / maxPerPage);
                let currentPage = 1;

                const generateEmbed = () => {
                    const start = (currentPage - 1) * maxPerPage;
                    const end = currentPage * maxPerPage;

                    const description = [];

                    for (let i = start; i < end; i++) {
                        if (i < mapIntCmds.length) {
                            description.push(mapIntCmds[i]);
                        }
                    }

                    return new EmbedBuilder()
                        .setTitle(`Slash Help [Page ${currentPage}/${totalPages}]`)
                        .setDescription(description.join('\n\n'))
                        .setFooter({ text: 'Slash help'})
                        .setTimestamp()
                        .setColor('White');
                };

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('<')
                    .setStyle(1);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('>')
                    .setStyle(1);

                const row = new ActionRowBuilder()
                    .addComponents(previousButton, nextButton);

                const message = await interaction.followUp({
                    embeds: [generateEmbed()],
                    components: [row],
                });

                const filter = (i) => i.customId === 'previous' || i.customId === 'next';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'previous') {
                        if (currentPage === 1) return;
                        currentPage--;
                    } else if (i.customId === 'next') {
                        if (currentPage === totalPages) return;
                        currentPage++;
                    }

                    await i.update({
                        embeds: [generateEmbed()],
                        components: [row],
                    });
                });

                collector.on('end', () => {
                    message.edit({ components: [] });
                });

                break;
            }

            case 'prefix': {
                const prefix = (await GuildSchema.findOne({ guild: interaction.guildId }))?.prefix || config.handler.prefix;

                const mapPreCmds = client.collection.prefixcommands
                    .filter(command => !command.nsfw)
                    .map((v) => `\`${prefix}${v.structure.name}\` (${v.structure.aliases.length > 0 ? v.structure.aliases.map((a) => `**${a}**`).join(', ') : 'None'}): ${v.structure.description || '[No description was provided]'}`);

                const maxPerPage = 10;
                const totalPages = Math.ceil((mapPreCmds.length) / maxPerPage);
                let currentPage = 1;

                const generateEmbed = () => {
                    const start = (currentPage - 1) * maxPerPage;
                    const end = currentPage * maxPerPage;

                    const description = [];

                    for (let i = start; i < end; i++) {
                        if (i < mapPreCmds.length) {
                            description.push(mapPreCmds[i]);
                        }
                    }

                    return new EmbedBuilder()
                        .setTitle(`Prefix Help [Page ${currentPage}/${totalPages}]`)
                        .setDescription(description.join('\n\n'))
                        .setFooter({ text: 'Prefix help'})
                        .setTimestamp()
                        .setColor('White');
                };

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('<')
                    .setStyle(1);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('>')
                    .setStyle(1);

                const row = new ActionRowBuilder()
                    .addComponents(previousButton, nextButton);

                const message = await interaction.followUp({
                    embeds: [generateEmbed()],
                    components: [row],
                });

                const filter = (i) => i.customId === 'previous' || i.customId === 'next';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'previous') {
                        if (currentPage === 1) return;
                        currentPage--;
                    } else if (i.customId === 'next') {
                        if (currentPage === totalPages) return;
                        currentPage++;
                    }

                    await i.update({
                        embeds: [generateEmbed()],
                        components: [row],
                    });
                });

                collector.on('end', () => {
                    message.edit({ components: [] });
                });

                break;
            }

            case 'nsfw': {
                if (!interaction.channel.nsfw) return interaction.followUp({
                    content: 'This only works in nsfw channels.'
                });

                const mapIntCmds = client.applicationcommandsArray
                    .filter(command => command.nsfw)
                    .map((v) => `\`/${v.name}\`: ${v.description}`);

                const maxPerPage = 10;
                const totalPages = Math.ceil((mapIntCmds.length) / maxPerPage);
                let currentPage = 1;

                const generateEmbed = () => {
                    const start = (currentPage - 1) * maxPerPage;
                    const end = currentPage * maxPerPage;

                    const description = [];

                    for (let i = start; i < end; i++) {
                        if (i < mapIntCmds.length) {
                            description.push(mapIntCmds[i]);
                        }
                    }

                    return new EmbedBuilder()
                        .setTitle(`NSFW Help [Page ${currentPage}/${totalPages}]`)
                        .setDescription(description.join('\n\n'))
                        .setFooter({ text: 'NSFW help'})
                        .setTimestamp()
                        .setColor('White');
                };

                const previousButton = new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('<')
                    .setStyle(1);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('>')
                    .setStyle(1);

                const row = new ActionRowBuilder()
                    .addComponents(previousButton, nextButton);

                const message = await interaction.followUp({
                    embeds: [generateEmbed()],
                    components: [row],
                });

                const filter = (i) => i.customId === 'previous' || i.customId === 'next';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'previous') {
                        if (currentPage === 1) return;
                        currentPage--;
                    } else if (i.customId === 'next') {
                        if (currentPage === totalPages) return;
                        currentPage++;
                    }

                    await i.update({
                        embeds: [generateEmbed()],
                        components: [row],
                    });
                });

                collector.on('end', () => {
                    message.edit({ components: [] });
                });

                break;
            }
        }
    }
};
