const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('List and buy available items.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('choose an action')
                .addChoices(
                    { name: 'list', value: 'list' },
                    { name: 'buy', value: 'buy' },
                    { name: 'sell', value: 'sell' }
                )
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')

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
                        .setTitle('Available Items list')
                        .addFields(
                            { name: 'Fishing Rod', value: `A tool used by fishermen to catch fish. Price: 300 Moonshard ${Moonshard}` },
                            { name: 'Shovel', value: `A tool used by archeologists to dig up relics. Price: 300 Moonshard ${Moonshard}` },
                            { name: 'Axe', value: `A tool used by hunters to hunt wildlife. Price: 300 Moonshard ${Moonshard}` },
                            { name: 'Paint Brush', value: `A tool used by artists to draw paintings. Price: 300 Moonshard ${Moonshard}` },
                            { name: 'Computer', value: `A tool used by streamers to stream stuff on the internet. Price: 300 Moonshard ${Moonshard}` }
                        )
                        .setFooter({ text: 'Items list' })
                        .setColor('White');

                    await interaction.reply({
                        embeds: [embed]
                    });
                    return;
                }
            }

            case 'buy': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    })
                    return
                } else {
                    const choices = [
                        'fishing rod',
                        'shovel',
                        'axe',
                        'paint brush',
                        'computer'
                    ]

                    let embed = new EmbedBuilder()
                        .setTitle(`Select an item to buy`)
                        .setDescription('Please select an item.')
                        .setFooter({ text: 'Shop buy' })
                        .setColor('White');

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('itembuy')
                        .setPlaceholder('select an item')
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

                    collector.on('collect', async (option) => {
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

                        const buyItem = jobItem(job)

                        const choice = option.values[0];

                        const hasItem = economy.items.find(item => item === choice)

                        if (economy.balance < 300) {
                            interaction.editReply({
                                content: `You have ${economy.balance} Moonshard ${Moonshard}. You need 300 Moonshard ${Moonshard} to buy this item.`,
                                embeds: [],
                                components: []
                            })
                            return;
                        }

                        if (hasItem) return interaction.editReply({
                            content: `You can't have more than one ${choice}.`,
                            embeds: [],
                            components: []
                        })

                        if (choice !== buyItem) {
                            await interaction.editReply({
                                content: `You are working as a ${job} and can only buy a ${buyItem}.`,
                                embeds: [],
                                components: []
                            });
                            return;
                        }

                        await EconomySchema.findOneAndUpdate(
                            {
                                guild: interaction.guildId,
                                user: interaction.member.user.id,
                                job: economy.job
                            },
                            {
                                $push: {
                                    items: buyItem
                                },
                                balance: economy.balance - 300
                            }
                        );

                        const embed2 = new EmbedBuilder()
                            .setTitle(`Success!`)
                            .setDescription(`You successfully bought ${buyItem} for 300 Moonshard ${Moonshard}!`)
                            .setFooter({ text: 'Shop buy' })
                            .setColor('White');

                        await interaction.editReply({
                            embeds: [embed2],
                            components: []
                        });
                    })
                }

                break;
            }

            case 'sell': {
                if (!economy) {
                    interaction.reply({
                        content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
                    });
                    return;
                } else {
                    let embed = new EmbedBuilder()
                        .setTitle(`Sell an item`)
                        .setDescription('Please type the name of the item you want to sell in the text box below and specify the quantity (e.g., `apple 5`).')
                        .setFooter({ text: 'Shop sell' })
                        .setColor('White');
            
                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
            
                    const filter = (response) => response.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({
                        filter,
                        max: 1,
                    });
            
                    collector.on('collect', async (message) => {
                        const input = message.content;
                        const [item, quantity] = input.trim().split(/\s+/);
            
                        if (item && quantity && !isNaN(quantity)) {
                            const typedItem = item.toLowerCase();
                            const itemCount = economy.items.filter(item => item.toLowerCase() === typedItem).length;
            
                            if (itemCount >= quantity) {
                                // User has enough of the item
                                const sellingPricePerItem = 150; // Adjust as needed
            
                                const totalMoney = sellingPricePerItem * Number(quantity); // Corrected calculation
            
                                // Remove items and update balance
                                for (let i = 0; i < quantity; i++) {
                                    const itemIndex = economy.items.findIndex(item => item.toLowerCase() === typedItem);
                                    if (itemIndex !== -1) {
                                        economy.items.splice(itemIndex, 1);
                                    }
                                }
            
                                economy.balance += totalMoney;
            
                                await economy.save();
            
                                const embed2 = new EmbedBuilder()
                                    .setTitle(`Success!`)
                                    .setDescription(`You successfully sold ${quantity} ${typedItem}(s) for ${totalMoney} Moonshard ${Moonshard}!`)
                                    .setFooter({ text: 'Shop sell' })
                                    .setColor('White');
            
                                interaction.followUp({
                                    embeds: [embed2]
                                });
                            } else {
                                interaction.followUp({
                                    content: `You don't have enough ${typedItem}.`
                                });
                            }
                        } else {
                            interaction.followUp({
                                content: "Invalid input. Please provide the item name and a valid quantity (e.g., `apple 5`)."
                            });
                        }
                    });
                }
            
                break;
            }            
        }
    }
};
