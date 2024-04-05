const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: {
        name: 'userinfo',
        description: 'Display a user\'s avatar!',
        aliases: ['user']
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {
        const mention = message.mentions.members.first();
        if (mention) {
            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${mention.user.username}`)
                        .setThumbnail(mention.displayAvatarURL(
                            { size: 256 }
                        ))
                        .addFields(
                            { name: 'Joined Discord on', value: `${mention.user.createdAt.toDateString()}`},
                            { name: `Joined ${message.guild.name} on`, value: `${mention.joinedAt.toDateString()}`},
                            { name: 'User ID', value: `${mention.id}`},
                            { name: `Roles [${mention.roles.cache.size}]`, value: `${mention.roles.cache.map(role => role).join(", ")}`},
                        )
                        .setFooter({ text: 'User Information' })
                        .setTimestamp()
                        .setColor('White')
                ]
            });
        } else {
            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${message.member.user.username}`)
                        .setThumbnail(message.member.displayAvatarURL(
                            { size: 256 }
                        ))
                        .addFields(
                            { name: 'Joined Discord on', value: `${message.member.user.createdAt.toDateString()}` },
                            { name: `Joined ${message.guild.name} on`, value: `${message.member.joinedAt.toDateString()}` },
                            { name: 'User ID', value: `${message.member.id}` },
                            { name: `Roles [${message.member.roles.cache.size}]`, value: `${message.member.roles.cache.map(role => role).join(", ")}` },
                        )
                        .setFooter({ text: 'User Information' })
                        .setTimestamp()
                        .setColor('White')
                ]
            });
        }
    }
};
