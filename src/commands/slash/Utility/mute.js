const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const ms = require('ms');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user.')
        .addMentionableOption(option =>
            option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Mute duration')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {

        if (interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.MuteMembers)) {
            const user = interaction.options.get('user').value;
            const duration = interaction.options.get('duration').value;
            const msDuration = ms(duration);
            const targetUser = await interaction.guild.members.fetch(user);

            const targetUserRolePos = targetUser.roles.highest.position;
            const requestUserRolePos = interaction.member.roles.highest;
            const botRolePos = interaction.guild.members.me.roles.highest.position;

            await interaction.deferReply()

            if (targetUserRolePos >= requestUserRolePos) {
                await interaction.editReply({
                    content: 'You can\'t time out that user because they have the same or higher role than you.'
                })
                return;
            }

            if (targetUserRolePos >= botRolePos) {
                await interaction.editReply({
                    content: 'I can\'t time out that user because they have the same or higher role than me.'
                })
                return;
            }

            if (!targetUser) {
                await interaction.editReply({
                    content: 'Please provide a valid user to mute.'
                })
                return;
            }

            if (targetUser.user.bot) {
                await interaction.editReply({
                    content: 'You can\'t time out a bot.'
                })
                return;
            }

            if (isNaN(msDuration)) {
                await interaction.editReply({
                    content: 'Please provide a valid timeout duration.'
                })
                return;
            }

            if (msDuration < 5000 || msDuration > 2.419e9) {
                await interaction.editReply({
                    content: 'Timeout duration can\'t be less than 5 seconds or more than 28 days.'
                })
                return;
            }

            try {
                const { default: prettyMs } = await import('pretty-ms');

                if (targetUser.isCommunicationDisabled()) {
                    await targetUser.timeout(msDuration);
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Success!')
                                .setDescription(`${targetUser} was timed out for ${prettyMs(msDuration)}.`)
                                .setFooter({ text: 'Time out' })
                                .setTimestamp()
                        ]
                    })
                }

                await targetUser.timeout(msDuration);
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Success!')
                            .setDescription(`${targetUser} was timed out for ${prettyMs(msDuration)}.`)
                            .setFooter({ text: 'Time out' })
                            .setTimestamp()
                            .setColor('White')
                    ]
                });
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
