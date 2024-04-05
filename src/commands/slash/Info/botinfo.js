const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Gives information about this bot.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username}`)
                    .setThumbnail(interaction.client.user.displayAvatarURL(
                        { size: 256, extension: 'png'}
                    ))
                    .addFields(
                        { name: 'Created on', value: `${interaction.client.user.createdAt.toDateString()}`},
                        { name: 'User ID', value: `${interaction.client.user.id}`},
                        { name: 'Server count', value: `In ${interaction.client.guilds.cache.size} servers`},
                        { name: 'Invite to server', value: `Click [here](https://discord.com/api/oauth2/authorize?client_id=1087446945561333760&permissions=8&scope=applications.commands%20bot) to add ${interaction.client.user.username} to a server!`},
                        { name: 'Support', value: `Click [here](https://discord.gg/3RqfZrwpp3) to join ${interaction.client.user.username}'s support server!`}
                    )
                    .setFooter({ text: 'Bot Information' })
                    .setTimestamp()
                    .setColor('White')
            ]
        })
    }
};
