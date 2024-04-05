const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../../config');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: {
        name: 'serverinfo',
        description: 'Gives information about this server.',
        aliases: ['server', 'sv']
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {
        await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${message.guild.name}`)
                    .setThumbnail(message.guild.iconURL(
                        { size: 256 }
                    ))
                    .addFields(
                        { name: 'Owner', value: `<@${message.guild.ownerId}>` },
                        { name: 'Created on', value: `${message.guild.createdAt.toDateString()}` },
                        { name: 'Members', value: `${message.guild.memberCount}` },
                        { name: 'Server ID', value: `${message.guild.id}` },
                        { name: 'Channels', value: `${message.guild.channels.cache.size}` }
                    )
                    .setFooter({ text: 'Server Information' })
                    .setTimestamp()
                    .setColor('White')
            ]
        });
    }
};
