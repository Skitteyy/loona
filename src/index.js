const { EmbedBuilder } = require('discord.js');
const GuildSchema = require('./schemas/GuildSchema');
const EconomySchema = require('./schemas/EconomySchema');

var EcoCooldown = [];
var XPCooldown = [];


require('dotenv').config();
const ExtendedClient = require('./class/ExtendedClient');
const LevelsSchema = require('./schemas/LevelsSchema');

const client = new ExtendedClient();

client.start();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    await handleEconomy(message);

    await handleXP(message);

    if (message.author.id === '821681414947733504') {
        if (message.content.startsWith('loona.')) {
            const messageContent = message.content.slice('loona.'.length);
            message.delete();
            message.channel.send(messageContent);
            console.log(`Loona command triggered: ${messageContent}`);
        }
    }
});

async function handleEconomy(message) {
    let economy = await EconomySchema.findOne({
        guild: message.guildId,
        user: message.author.id
    });

    const balance = await EconomySchema.findOne({
        guild: message.guildId,
        user: message.author.id,
        balance: {
            $exists: true
        }
    });

    if (!economy || !balance) {
        return;
    }

    if (EcoCooldown.includes(message.author.id)) return;

    const randomAmount = Math.floor(Math.random() * 10) + 1;

    const updatedBalance = economy.balance + randomAmount;

    await EconomySchema.find({
        guild: message.guildId,
        user: message.author.id
    }).updateOne({
        balance: updatedBalance
    });

    EcoCooldown.push(message.author.id);
    setTimeout(() => {
        EcoCooldown.shift();
    }, 30 * 1000);
}

async function handleXP(message) {
    const hasLeveling = await GuildSchema.findOne({
        guild: message.guildId,
        leveling: "enabled"
    });

    if (!hasLeveling) {
        return;
    }

    if (XPCooldown.includes(message.author.id)) {
        return;
    }

    let levelData = await LevelsSchema.findOne({
        guild: message.guildId,
        user: message.author.id
    });

    if (!levelData) {
        levelData = new LevelsSchema({
            guild: message.guildId,
            user: message.author.id,
            level: 0,
            xp: 0,
            totalXp: 0
        });
        await levelData.save();
    }

    const xpGain = 1;
    const newXp = levelData.xp + xpGain;
    const newTotalXp = levelData.totalXp + xpGain;

    const updateResult = await LevelsSchema.updateOne(
        { guild: message.guildId, user: message.author.id },
        { xp: newXp, totalXp: newTotalXp }
    );

    const getRequiredXP = (level) => {
        if (level === 0) return 10;
        return Math.floor(10 * Math.pow(1.15, level - 1));
    };

    const requiredXP = getRequiredXP(levelData.level);

    if (newXp >= requiredXP) {
        const newLevel = levelData.level + 1;
        levelData.xp = 0;

        await LevelsSchema.updateOne(
            { guild: message.guildId, user: message.author.id },
            { level: newLevel, xp: levelData.xp }
        );

        let embed = new EmbedBuilder()
            .setTitle(`${message.author.username} Leveled up!`)
            .setDescription(`**Level** ${levelData.level} -> ${newLevel}\n**Total XP:** ${newTotalXp}`)
            .setFooter({ text: 'Level Up' })
            .setTimestamp()
            .setColor('White');

        message.channel.send({
            embeds: [embed]
        });
    }

    XPCooldown.push(message.author.id);
    setTimeout(() => {
        XPCooldown.shift();
    }, 30 * 1000);
}

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
        if (message.author.id === '821681414947733504' && message.content.startsWith('loona.')) return;

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
            if (message.author.id === '821681414947733504' && message.content.startsWith('loona.')) return;

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