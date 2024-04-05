const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: {
        name: 'avatar',
        description: 'Display a user\'s avatar!',
        aliases: ['av']
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
                        .setTitle(`${mention.user.username}'s Avatar`)
                        .setImage(mention.displayAvatarURL(
                            { size: 1024 }
                        ))
                        .setFooter({ text: 'User Avatar' })
                        .setTimestamp()
                        .setColor('White')
                ]
            });
        } else {
            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${message.member.user.username}'s Avatar`)
                        .setImage(message.member.displayAvatarURL(
                            { size: 1024 }
                        ))
                        .setFooter({ text: 'User Avatar' })
                        .setTimestamp()
                        .setColor('White')
                ]
            });
        }
    }
};
