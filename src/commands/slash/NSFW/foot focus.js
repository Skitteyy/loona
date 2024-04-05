const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const booru = require('booru');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('footfocus')
        .setDescription('Sends a picture tagged with \'foot_focus\' from danbooru.donmai.us')
        .setNSFW(true),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        if (interaction.channel.nsfw) {
            booru.search('db', ['foot_focus'], { limit: 1, random: true }).then(async posts => {
                for (let post of posts) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('foot focus')
                                .setImage(post.file_url)
                                .setDescription(`Post: ${post.postView}`)
                                .setTimestamp()
                                .setColor('White')
                        ]
                    })
                }
            });
        } else {
            interaction.reply({
                content: 'This only works in nsfw channels.'
            })
        }
    }
};