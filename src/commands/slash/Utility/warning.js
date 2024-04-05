const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const ModSchema = require('../../../schemas/ModSchema');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('warning')
        .setDescription('Manage user warnings.')
        .addSubcommand((subcommand) =>
            subcommand.setName('give')
                .setDescription('Give a warning to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to warn')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Warn reason')
                        .setRequired(true)))
        .addSubcommand((subcommand) =>
            subcommand.setName('list')
                .setDescription('List a user\'s warnings')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User whose warnings to list')
                        .setRequired(true)))
        .addSubcommand((subcommand) =>
            subcommand.setName('remove')
                .setDescription('Remove a warning from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User whose warning to remove')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('warnid')
                        .setDescription('Id of desired warning')
                        .setRequired(true))),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        let targetUser = interaction.guild.members.fetch(interaction.options.getUser('user'));
        let reason = interaction.options.getString('reason');

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === 'give') {
            const user = interaction.options.get('user').value;
            const reason = interaction.options.get('reason').value;

            const targetUser = await interaction.guild.members.fetch(user);

            let data = await ModSchema.findOne({
                guild: interaction.guildId,
                user: targetUser.id,
                staff: interaction.member.id,
                reason: reason
            });

            if (!data) data = new ModSchema({
                guild: interaction.guildId,
                user: targetUser.id,
                staff: interaction.member.id,
                reason: reason
            });

            data.save();

            let data2 = await GuildSchema.findOne({
                guild: interaction.guildId,
            });

            if (!data2) data2 = new GuildSchema({
                guild: interaction.guildId
            });

            if (interaction.user.id === targetUser.id) {
                await interaction.reply({
                    content: 'You can\'t warn yourself.'
                })
                return;
            }

            if (!reason) {
                await interaction.reply({
                    content: 'You need to provide a reason.'
                })
            }

            if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`${targetUser.user.username} has been warned for **${reason}**.`)
                            .setFooter({ text: 'User warn' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })
            }
            else
                await interaction.reply({
                    content: 'You don\'t have permission to do that.'
                })

            const channel = (await targetUser).guild.channels.cache.get(data2.logChannel);

            if (!channel) {
                console.log(`${data.guild} does not have a logs channel.`)
                return;
            }

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('User warned')
                        .setDescription(`${targetUser.user.username} has been warned for **${reason}**.`)
                        .setFooter({ text: 'User warn' })
                        .setTimestamp()
                        .setColor('White')
                ]
            })

            targetUser.send(`You have been warned in **${interaction.guild.name}** for **${reason}**`)
        } else if (subcommand === 'list') {
            const user = interaction.options.get('user').value;

            const targetUser = await interaction.guild.members.fetch(user);

            let data2 = await ModSchema.find({
                guild: interaction.guildId,
                user: targetUser.id
            });

            if (!data2) data2 = new ModSchema({
                guild: interaction.guildId,
                user: targetUser.id
            });

            const warns = data2.map((warn) => {
                return [
                    `Warning id: ${warn._id}`,
                    `Warned by: <@${warn.staff || 'User not in server.'}>`,
                    `reason: ${warn.reason}`
                ].join('\n');
            }).join('\n\n')

            if (!data2 || !warns) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('User Warns')
                            .setDescription(`${targetUser} doesn\'t have any warnings.`)
                            .setFooter({ text: 'User warns' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                });
                return;
            }

            if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('User Warns')
                            .setDescription(`${warns}`)
                            .setFooter({ text: 'User warns' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })
            }
            else
                await interaction.reply({
                    content: 'You don\'t have permission to do that.'
                })
        } else if (subcommand === 'remove') {

            const user = interaction.options.get('user').value;
            const warnid = interaction.options.getString('warnid');

            const targetUser = await interaction.guild.members.fetch(user);

            let data = await ModSchema.findOne({
                guild: interaction.guildId,
                user: targetUser.id,
                staff: interaction.member.id,
                reason: reason
            });

            if (!data) data = new ModSchema({
                guild: interaction.guildId,
                user: targetUser.id,
                staff: interaction.member.id,
                reason: reason
            });

            let data2 = await GuildSchema.findOne({
                guild: interaction.guildId
            });

            if (!data2) data2 = new GuildSchema({
                guild: interaction.guildId
            });

            let data3 = await ModSchema.findById(warnid)

            if (!data3) return interaction.reply({
                content: `${warnid} is not a valid id!`
            })

            data3.deleteOne()

            if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`Removed a warning with the id **${warnid}** from <@${targetUser.id}>.`)
                            .setFooter({ text: 'Warn removal' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })
            }
            else
                await interaction.reply({
                    content: 'You don\'t have permission to do that.'
                })

            const channel = (await targetUser).guild.channels.cache.get(data2.logChannel);

            if (!channel) {
                console.log(`${data.guild} does not have a logs channel.`)
                return;
            }

            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Warning removed')
                        .setDescription(`Removed a warning with the id **${warnid}** from <@${targetUser.id}>.`)
                        .setFooter({ text: 'User warn' })
                        .setTimestamp()
                        .setColor('White')
                ]
            })
        }
    }
};