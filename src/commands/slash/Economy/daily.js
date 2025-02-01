const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');
const TimeSchema = require('../../../schemas/TimeSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily Moonshard!')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('choose an action')
                .addChoices(
                    { name: 'claim', value: 'claim' },
                    { name: 'check', value: 'check' }
                )
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const nextDailyDate = new Date(currentDate)
        nextDailyDate.setDate(currentDate.getDate() + 1);

        let economy = await EconomySchema.findOne({
            guild: interaction.guildId,
            user: interaction.member.user.id
        })

        if (!economy) {
            interaction.reply({
                content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
            })
            return
        }

        let balance = economy.balance

        let daily = await TimeSchema.findOne({
            guild: interaction.guildId,
            user: interaction.user.id
        });

        switch (interaction.options.getString('action')) {
            case 'claim': {
                if (!daily) {
                    new TimeSchema({
                        guild: interaction.guildId,
                        user: interaction.user.id,
                        lastDaily: currentDate,
                        nextDaily: nextDailyDate
                    }).save();

                    let embed = new EmbedBuilder()
                        .setTitle(`Daily Moonshard`)
                        .setDescription(`Here is your daily 5000 Moonshard ${Moonshard}.`)
                        .setFooter({ text: 'Daily claim' })
                        .setColor('White')
                        .setTimestamp();

                    interaction.reply({
                        embeds: [embed]
                    });

                    await EconomySchema.find({
                        guild: interaction.guildId,
                        user: interaction.user.id
                    }).updateOne({
                        balance: balance + 5000
                    });

                    return;
                } else {
                    if (!daily.lastDaily || daily.lastDaily.toISOString() !== currentDate.toISOString()) {
                        let embed = new EmbedBuilder()
                            .setTitle(`Daily Moonshard`)
                            .setDescription(`Here is your daily 5000 Moonshard ${Moonshard}.`)
                            .setFooter({ text: 'Daily claim' })
                            .setColor('White')
                            .setTimestamp();

                        interaction.reply({
                            embeds: [embed]
                        });

                        await EconomySchema.find({
                            guild: interaction.guildId,
                            user: interaction.user.id
                        }).updateOne({
                            balance: balance + 5000
                        })

                        await TimeSchema.findOneAndUpdate(
                            { guild: interaction.guildId, user: interaction.user.id },
                            { lastDaily: currentDate, nextDaily: nextDailyDate }
                        );

                        return;
                    } else {
                        let embed = new EmbedBuilder()
                            .setTitle(`Daily Moonshard`)
                            .setDescription(`You already claimed your daily Moonshard ${Moonshard} today. Use \`\`\`/daily check\`\`\` to see when you can claim it next.`)
                            .setFooter({ text: 'Daily claim' })
                            .setColor('White')
                            .setTimestamp();

                        interaction.reply({
                            embeds: [embed]
                        });

                        return;
                    }
                }
            }

            case 'check': {
                if (!daily) {
                    let embed = new EmbedBuilder()
                        .setTitle(`Daily Moonshard`)
                        .setDescription(`Your daily Moonshard ${Moonshard} is ready to be claimed.`)
                        .setFooter({ text: 'Daily check' })
                        .setColor('White')
                        .setTimestamp();

                    interaction.reply({
                        embeds: [embed]
                    });

                    return;
                } else {
                    if (!daily.lastDaily || daily.lastDaily.toISOString() !== currentDate.toISOString()) {
                        let embed = new EmbedBuilder()
                            .setTitle(`Daily Moonshard`)
                            .setDescription(`Your daily Moonshard ${Moonshard} is ready to be claimed.`)
                            .setFooter({ text: 'Daily check' })
                            .setColor('White')
                            .setTimestamp();

                        interaction.reply({
                            embeds: [embed]
                        });

                        return;
                    } else {
                        const nextDailyTime = new Date(daily.nextDaily);
                        const botTime = new Date();

                        const duration = Math.floor((nextDailyTime - botTime) / 1000);

                        const hours = Math.floor(duration / 3600);
                        const minutes = Math.floor((duration % 3600) / 60);
                        const seconds = duration % 60;
                        const remainingTime = `${hours}h ${minutes}m ${seconds}s`

                        let embed = new EmbedBuilder()
                            .setTitle(`Daily Moonshard`)
                            .setDescription(`Your daily Moonshard ${Moonshard} can be claimed again in ${remainingTime}.`)
                            .setFooter({ text: 'Daily check' })
                            .setColor('White')
                            .setTimestamp();

                        interaction.reply({
                            embeds: [embed]
                        });

                        return;
                    }
                }
            }
        }
    }
};
