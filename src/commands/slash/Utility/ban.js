const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user.')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Ban reason')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        if (interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const user = interaction.options.get('user').value;
            const reason = interaction.options.get('reason').value;
            const targetUser = await interaction.guild.members.fetch(user);

            const targetUserRolePos = targetUser.roles.highest.position;
            const requestUserRolePos = interaction.member.roles.highest;
            const botRolePos = interaction.guild.members.me.roles.highest.position;

            await interaction.deferReply()

            if (targetUserRolePos >= requestUserRolePos) {
                await interaction.editReply({
                    content: 'You can\'t ban that user because they have the same or higher role than you.'
                })
                return;
            }

            if (targetUserRolePos >= botRolePos) {
                await interaction.editReply({
                    content: 'I can\'t ban that user because they have the same or higher role than me.'
                })
                return;
            }

            if (!targetUser) {
                await interaction.editReply({
                    content: 'Please provide a valid user to ban.'
                })
                return;
            }

            try {
                if (!targetUser.user.bot) {
                    await targetUser.send({
                        content: `You have been banned from ${interaction.guild.name} for **${reason}**.`
                    });
                }

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`${targetUser.user.username} has been banned for **${reason}**.`)
                            .setFooter({ text: 'User Ban' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                })
                await targetUser.ban(
                    { reason: reason }
                )
            } catch (error) {
                console.log(error)
            }
        }
        else
            await interaction.reply({
                content: 'You don\'t have permission to do that.'
            })

    }
};
