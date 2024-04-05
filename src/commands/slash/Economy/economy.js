const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('manage your economy account')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('choose an action')
                .addChoices(
                    { name: 'create', value: 'create' },
                    { name: 'delete', value: 'delete' },
                    { name: 'leaderboard', value: 'leaderboard' }
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
            user: interaction.member.user.username
        })

        switch (interaction.options.getString('action')) {
            case 'create': {
                if (economy) {
                    await interaction.reply({
                        content: 'You already have an economy account.'
                    })
                    return;
                } else {
                    economy = await new EconomySchema({
                        guild: interaction.guildId,
                        user: interaction.member.user.username,
                        job: 'unemployed'
                    }).save()

                    await interaction.reply({
                        content: 'You have successfully created an economy account.'
                    })
                    return;
                }
            }

            case 'delete': {
                if (economy) {
                    const choices = [
                        'confirm',
                        'cancel'
                    ]

                    let embed = new EmbedBuilder()
                        .setTitle(`Delete Economy Account?`)
                        .setDescription(`Are you sure you want to delete your economy account?`)
                        .setFooter({ text: 'Economy Delete' })
                        .setColor('White');

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('confirm')
                        .setPlaceholder('Delete your Economy Account?')
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
                        if (interaction.values[0] === 'confirm') {
                            await EconomySchema.findOneAndDelete({
                                guild: interaction.guildId,
                                user: interaction.member.user.username
                            })

                            await interaction.reply({
                                content: 'Your economy account for this server has been successfully deleted.'
                            })
                            return;
                        } else {
                            await interaction.reply({
                                content: `Economy Account deletion has been cancelled.`
                            })
                        }
                    })
                } else {
                    await interaction.reply({
                        content: 'You don\'t have an economy account to delete.'
                    })
                    return;
                }
            }

                break;

            case 'leaderboard': {
                const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')

                const users = await EconomySchema.find({
                    guild: interaction.guildId,
                    user: {
                        $exists: true
                    }
                });

                if (users) {

                    const sorted = users.sort((a, b) => {
                        return b.balance - a.balance;
                    }).slice(0, 10);

                    const list = sorted.map((user, index) => {
                        return `${index + 1}. ${user.user}: ${user.balance} ${Moonshard}`;
                    }).join('\n');

                    let embed = new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} Leaderboard`)
                        .setDescription(list)
                        .setFooter({ text: 'Server Leaderboard' })
                        .setColor('White')

                    return interaction.reply({
                        embeds: [embed]
                    })
                } else {
                    interaction.reply({
                        content: 'This server does not have a leaderboard yet. Users have to create accounts first using ```economy create```'
                    })
                    return;
                }
            }
        }
    }
};
