const { Message, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const booru = require('booru')

module.exports = {
    structure: {
        name: 'customsearch',
        description: 'search up to two tags on danbooru.donmai.us',
        aliases: ['db', 'danbooru']
    },
    /**
     * @param {ExtendedClient} client 
     * @param {Message} message 
     * @param {[String]} args 
     */
    run: async (client, message, args) => {
        if (message.channel.nsfw) {
            if (args[0]) {

                if (!args[1]) {
                    booru.search('db', [`${args[0]}`], { limit: 99999 })
                        .then(async images => {
                            const random = Math.floor(Math.random() * images.posts.length);
                            let image = images.posts[random];

                            let embed = new EmbedBuilder()
                                .setTitle('Custom Search')
                                .setDescription(`${image.postView}`)
                                .setImage(image.file_url)
                                .setFooter({ text: `Tags searched: ${args[0]}` })

                            await message.channel.send({
                                embeds: [embed]
                            })
                        })
                }

                if (args[1]) {
                    booru.search('db', [`${args[0]}`, `${args[1]}`], { limit: 99999 })
                        .then(async images => {
                            const random = Math.floor(Math.random() * images.posts.length);
                            let image = images.posts[random];

                            let embed = new EmbedBuilder()
                                .setTitle('Custom Search')
                                .setDescription(`${image.postView}`)
                                .setImage(image.file_url)
                                .setFooter({ text: `Tags searched: ${args[0]}, ${args[1]}` })

                            await message.channel.send({
                                embeds: [embed]
                            })
                        })
                }
            }
        } else {
            message.reply({
                content: 'This only works in nsfw channels.'
            })
        }
    }
};
