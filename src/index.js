const { EmbedBuilder } = require('discord.js');
const GuildSchema = require('./schemas/GuildSchema');
const EconomySchema = require('./schemas/EconomySchema');

var cooldown = [];


require('dotenv').config();
const ExtendedClient = require('./class/ExtendedClient');

const client = new ExtendedClient();

client.start();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.on('messageCreate', async (message) => {
    let economy = await EconomySchema.findOne({
        guild: message.guildId,
        user: message.author.username
    });

    const balance = await EconomySchema.findOne({
        guild: message.guildId,
        user: message.author.username,
        balance: {
            $exists: true
        }
    });

    if (cooldown.includes(message.author.id)) return;

    if (!economy) return;

    if (!balance) return;

    const randomAmount = Math.floor(Math.random() * 10) + 1;

    const updatedBalance = Math.floor(economy.balance + randomAmount);

    await EconomySchema.find({
        guild: message.guildId,
        user: message.author.username
    }).updateOne({
        balance: updatedBalance
    })

    cooldown.push(message.author.id);
    setTimeout(() => {
        cooldown.shift();
    }, 30 * 1000);

    if (message.author.id === '821681414947733504') {
        if (message.content.startsWith('loona.')) {
            const messageContent = message.content.slice('loona.'.length);

            message.delete()

            message.channel.send(messageContent);
        }
    } else return;
});

client.on('messageDelete', async (message) => {
    let data = await GuildSchema.findOne({ guild: message.guildId });

    if (!data) data = new GuildSchema({
        guild: message.guildId
    });

    const channel = message.guild.channels.cache.get(data.logChannel);

    if (message.channel === channel) return;

    if (!channel) return;

    if (message.author.bot) return;

    if (message.content || message.attachments.size > 0) {
        if (message.author.id === '821681414947733504' && message.content.startsWith('lunaria.')) return;

        const embed = new EmbedBuilder()
            .setTitle('Message deleted')
            .addFields(
                { name: 'Author', value: `<@${message.member.user.id}>` },
                { name: 'Channel', value: `<#${message.channelId}>` }
            )
            .setFooter({ text: `Message deletion` })
            .setTimestamp()
            .setColor('Red')

        if (message.content) {
            embed.addFields(
                { name: 'Message', value: `"${message.content}"` }
            )
        }

        if (message.attachments.size > 0) {
            if (message.author.id === '821681414947733504' && message.content.startsWith('lunaria.')) return;

            const attachment = message.attachments.map(attachment => attachment.url)
            embed.addFields(
                { name: 'Media', value: `"${attachment.join('", "')}"` }
            )
        }

        await channel.send({
            embeds: [embed]
        })
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    let data = await GuildSchema.findOne({ guild: newMessage.guildId });

    if (!data) data = new GuildSchema({
        guild: newMessage.guildId
    });

    const channel = newMessage.guild.channels.cache.get(data.logChannel);

    if (newMessage.channel === channel) return;

    if (!channel) return;

    if (oldMessage.author.bot || newMessage.author.bot) return;

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle('Message edited')
                .addFields(
                    { name: 'Author', value: `<@${newMessage.member.user.id}>` },
                    { name: 'Channel', value: `<#${newMessage.channelId}>` },
                    { name: 'Message ID', value: `${oldMessage.id}` },
                    { name: 'Before:', value: `"${oldMessage.content}"` },
                    { name: 'After:', value: `"${newMessage.content}"` }
                )
                .setFooter({ text: `Message edit` })
                .setTimestamp()
                .setColor('Blue')
        ]
    })
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    let data = await GuildSchema.findOne({ guild: newMember.guild.id });

    if (!data) data = new GuildSchema({
        guild: newMember.guild.id
    });

    if (newMember.client.user.bot) return;

    const channel = newMember.guild.channels.cache.get(data.logChannel);

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) {

                if (!channel) return;

                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Role updated')
                            .addFields(
                                { name: 'Member', value: `<@${newMember.user.id}>` },
                                { name: 'Role removed:', value: `${role}` }
                            )
                            .setFooter({ iconURL: `${oldMember.displayAvatarURL()}`, text: `${oldMember.user.username}` })
                            .setTimestamp()
                            .setColor('Red')
                    ]
                });
            }
        });
    } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) {

                if (!channel) return;

                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Role updated')
                            .addFields(
                                { name: 'Member', value: `<@${newMember.user.id}>` },
                                { name: 'Role added:', value: `${role}` }
                            )
                            .setFooter({ iconURL: `${oldMember.displayAvatarURL()}`, text: `${oldMember.user.username}` })
                            .setTimestamp()
                            .setColor('Green')
                    ]
                });
            }
        })
    }

    if (oldMember.nickname !== newMember.nickname) {
        if (!channel) return;

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Nickname updated')
                    .setDescription(`Old Nickname: ${oldMember.nickname || oldMember.user.username}\nNew Nickname: ${newMember.nickname || newMember.user.username}`)
                    .setFooter({ iconURL: `${oldMember.displayAvatarURL()}`, text: `${oldMember.user.username}` })
                    .setTimestamp()
                    .setColor('Green')
            ]
        });
    }
});

client.on('userUpdate', async (oldUser, newUser) => {
    client.guilds.cache.forEach(async (guild) => {
        if (guild.members.cache.has(newUser.id)) {
            let data = await GuildSchema.findOne({ guild: guild.id });

            if (!data) {
                data = new GuildSchema({
                    guild: guild.id
                });
            }

            const channel = guild.channels.cache.get(data.logChannel);

            if (!channel) {
                return;
            }

            if (oldUser.bot) {
                return;
            }

            if (oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Avatar updated')
                            .setDescription(`<@${newUser.id}>`)
                            .setImage(newUser.displayAvatarURL({ size: 1024 }))
                            .setFooter({ iconURL: `${newUser.displayAvatarURL()}`, text: `${newUser.username}` })
                            .setTimestamp()
                            .setColor('Blue')
                    ]
                });
            }

            if (oldUser.username !== newUser.username) {
                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Username updated')
                            .setDescription(`Old username: ${oldUser.username}\nNew username: ${newUser.username}`)
                            .setFooter({ iconURL: `${newUser.displayAvatarURL()}`, text: `${newUser.username}` })
                            .setTimestamp()
                            .setColor('Blue')
                    ]
                });
            }
        }
    });
});

client.on('guildMemberRemove', async member => {
    let data = await GuildSchema.findOne({ guild: member.guild.id });

    if (!data) data = new GuildSchema({
        guild: member.guild.id
    });

    const channel = member.guild.channels.cache.get(data.logChannel);

    if (!channel) return;

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle('Member left')
                .setThumbnail(member.displayAvatarURL({
                    size: 1024
                }))
                .addFields(
                    { name: 'Member', value: `<@${member.user.id}> (${member.user.tag})` },
                    { name: 'Joined on', value: `${member.joinedAt.toDateString()}` },
                    { name: 'Created on', value: `${member.user.createdAt.toDateString()}` },
                    { name: `Roles [${member.roles.cache.size}]`, value: `${member.roles.cache.map(role => role).join(", ")}` }
                )
                .setFooter({ iconURL: `${member.displayAvatarURL()}`, text: `${member.user.username}` })
                .setTimestamp()
                .setColor('Red')
        ]
    })
});

client.on('guildMemberAdd', async member => {
    let data = await GuildSchema.findOne({ guild: member.guild.id });

    if (!data) data = new GuildSchema({
        guild: member.guild.id
    });

    const channel = member.guild.channels.cache.get(data.logChannel);

    if (!channel) return;

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle('Member joined')
                .setThumbnail(member.displayAvatarURL({
                    size: 1024
                }))
                .addFields(
                    { name: 'Member', value: `<@${member.user.id}> (${member.user.tag})` },
                    { name: 'Created on', value: `${member.user.createdAt.toDateString()}` }
                )
                .setFooter({ iconURL: `${member.displayAvatarURL()}`, text: `${member.user.username}` })
                .setTimestamp()
                .setColor('Green')
        ]
    })

    if (member.guild.id === '1087439373458485299') {
        const channel = member.guild.channels.cache.get('1087470137818488903');

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor(member.avatarURL())
                    .setTitle('New Member!')
                    .setThumbnail(member.displayAvatarURL({
                        size: 1024
                    }))
                    .setDescription(`Welcome to ${member.guild.name}, <@${member.user.id}>!\nMake sure to check out <#1087472089134538792> and <#1145011289106694194>.\nEnjoy your stay!`)
                    .setFooter({ iconURL: member.guild.iconURL(), text: `${member.guild.name}` })
                    .setTimestamp()
                    .setColor('White')
            ]
        })
    } else return;
});

client.on('guildCreate', async (guild) => {
    const channel = guild.client.channels.cache.get('1133502093806817471');

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(`${client.user.username} added`)
                .setThumbnail(guild.iconURL())
                .setDescription(`${client.user.username} is now in ${client.guilds.cache.size} servers.`)
                .addFields(
                    { name: 'Server name', value: `${guild.name}` },
                    { name: 'Server owner', value: `${(await guild.fetchOwner()).user.username}` },
                    { name: 'Members', value: `${guild.memberCount}` },
                    { name: 'Boost status', value: `Level: ${guild.premiumTier} Boosts: ${guild.premiumSubscriptionCount}` },
                    { name: 'Locale', value: `${guild.preferredLocale}` }
                )
                .setTimestamp()
                .setColor('White')
        ]
    })
});

client.on('guildDelete', async (guild) => {
    const channel = guild.client.channels.cache.get('1133502093806817471');

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(`${client.user.username} removed`)
                .setThumbnail(guild.iconURL())
                .setDescription(`${client.user.username} is now in ${client.guilds.cache.size} servers.`)
                .addFields(
                    { name: 'Server name', value: `${guild.name}` },
                    { name: 'Server owner', value: `${(await guild.fetchOwner()).user.username}` },
                    { name: 'Members', value: `${guild.memberCount}` },
                    { name: 'Boost status', value: `Level: ${guild.premiumTier} Boosts: ${guild.premiumSubscriptionCount}` },
                    { name: 'Locale', value: `${guild.preferredLocale}` }
                )
                .setTimestamp()
                .setColor('White')
        ]
    })
});