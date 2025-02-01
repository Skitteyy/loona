const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MentionableSelectMenuBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('job')
        .setDescription('Look for and manage your job')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('choose an action')
                .addChoices(
                    { name: 'list', value: 'list' },
                    { name: 'info', value: 'info' },
                    { name: 'apply', value: 'apply' },
                    { name: 'quit', value: 'quit' }
                )
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        let economy = await EconomySchema.findOne({
            guild: interaction.guildId,
            user: interaction.member.user.id
        })

        switch (interaction.options.getString('action')) {
            case 'list': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    })
                    return
                } else {
                    let embed = new EmbedBuilder()
                        .setTitle('Available Jobs list')
                        .addFields(
                            { name: 'Fisherman', value: 'Use a **fishing rod** to catch fish!' },
                            { name: 'Archeologist', value: 'Use a **shovel** and dig up ancient relics!' },
                            { name: 'Hunter', value: 'Use an **axe** to hunt wildlife!' },
                            { name: 'Artist', value: 'Use a **paint brush** to draw drawings!' },
                            { name: 'Streamer', value: 'Use a **computer** to live stream!' }
                        )
                        .setFooter({ text: 'Job list' })
                        .setColor('White');

                    await interaction.reply({
                        embeds: [embed]
                    });
                    return;
                }
            }

            case 'info': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    })
                    return
                } else {
                    const job = economy.job;
                    
                    let embed = new EmbedBuilder()
                        .setTitle(`Select a User`)
                        .setDescription('Please select a user.')
                        .setFooter({ text: 'Job info' })
                        .setColor('White');

                    const selectMenu = new MentionableSelectMenuBuilder()
                        .setCustomId('user')
                        .setPlaceholder('select a user')


                    const row = new ActionRowBuilder()
                        .addComponents(selectMenu);

                    await interaction.reply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: true
                    });

                    const filter = i => i.user.id === interaction.user.id

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter: filter,
                        componentType: ComponentType.MentionableSelect,
                        max: 1
                    })

                    collector.on('collect', async (interaction) => {
                        await interaction.deferReply();

                        const choice = interaction.values[0]

                        let embed2 = new EmbedBuilder()
                            .setTitle('User Job')
                            .addFields(
                                { name: 'User:', value: `<@${choice}>` },
                                { name: 'Job Satus', value: `${job}` }
                            )
                            .setFooter({ text: 'Job info' })
                            .setColor('White');

                        await interaction.editReply({
                            embeds: [embed2]
                        });
                        return;
                    })
                }
            }

                break;

            case 'apply': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    })
                    return
                } else {
                    const job = economy.job

                    if (!job.startsWith('unemployed') || !job.startsWith('')) return interaction.reply(`You are already working as a ${job}.`)

                    if (job.startsWith('unemployed') || job.startsWith('')) {

                        const choices = [
                            'fisherman',
                            'archeologist',
                            'hunter',
                            'artist',
                            'streamer'
                        ];

                        let embed = new EmbedBuilder()
                            .setTitle(`Select a Job`)
                            .setDescription('Please pick a job to apply for below.')
                            .setFooter({ text: 'Job application' })
                            .setColor('White');

                        const selectMenu = new StringSelectMenuBuilder()
                            .setCustomId('jobs')
                            .setPlaceholder('select a job')
                            .addOptions(choices.map(choice => ({
                                label: choice,
                                value: choice.toLowerCase(),
                            })));

                        const row = new ActionRowBuilder()
                            .addComponents(selectMenu);

                        await interaction.reply({
                            embeds: [embed],
                            components: [row],
                            ephemeral: true
                        });

                        const filter = i => i.user.id === interaction.user.id

                        const collector = interaction.channel.createMessageComponentCollector({
                            filter: filter,
                            componentType: ComponentType.StringSelect,
                            max: 1
                        })

                        collector.on('collect', async (interaction) => {
                            await interaction.deferReply();

                            const choice = interaction.values[0]
                            interaction.followUp(`You are now working as a ${choice}!`)

                            await EconomySchema.find({
                                guild: interaction.guildId,
                                user: interaction.member.user.id
                            }).updateOne({
                                job: choice
                            })
                        })
                    }
                }
            }

                break;

            case 'quit': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    })
                    return
                } else {
                    const job = economy.job;

                    function jobItem(job) {
                        switch (job) {
                            case 'fisherman':
                                return 'fishing rod';
                            case 'archeologist':
                                return 'shovel';
                            case 'hunter':
                                return 'axe';
                            case 'artist':
                                return 'paint brush';
                            case 'streamer':
                                return 'computer';
                            default:
                                return null;
                        }
                    }

                    const itemToDelete = jobItem(job)

                    const choices = [
                        'confirm',
                        'cancel'
                    ]

                    let embed = new EmbedBuilder()
                        .setTitle(`Quit your current job?`)
                        .setDescription(`Are you sure you want to quit your current job as a ${job}?`)
                        .setFooter({ text: 'Quit Job' })
                        .setColor('White');

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('confirm')
                        .setPlaceholder('Select')
                        .addOptions(choices.map(choice => ({
                            label: choice,
                            value: choice.toLowerCase(),
                        })));

                    const row = new ActionRowBuilder()
                        .addComponents(selectMenu);

                    await interaction.reply({
                        embeds: [embed],
                        components: [row],
                        ephemeral: true
                    });

                    const filter = i => i.user.id === interaction.user.id

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter: filter,
                        componentType: ComponentType.StringSelect,
                        max: 1
                    })

                    collector.on('collect', async (interaction) => {
                        await interaction.deferReply();

                        if (interaction.values[0] === 'confirm') {
                            const userDocument = await EconomySchema.findOne({
                                guild: interaction.guildId,
                                user: interaction.user.id
                            });

                            if (!job.includes('unemployed')) {
                                userDocument.items = userDocument.items.filter(item => item !== itemToDelete)
                                userDocument.job = 'unemployed'

                                userDocument.save();

                                interaction.editReply(`You quit your job as a ${job}.`)
                            } else {
                                interaction.editReply({
                                    content: `You don't have a job to quit`
                                })
                                return;
                            };
                        } else {
                            interaction.followUp(`You changed your mind and did not quit your job as a ${job}.`)
                            return;
                        }
                    })
                }
            }
        }
    }
};
