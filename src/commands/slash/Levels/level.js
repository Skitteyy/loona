const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const LevelsSchema = require('../../../schemas/LevelsSchema');
const GuildSchema = require('../../../schemas/GuildSchema');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('level')
        .setDescription('View a user\'s level and xp.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User whose level to view')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        const user = interaction.options.getUser('user').id;
        const username = interaction.options.getUser('user').username;

        let levelData = await LevelsSchema.findOne({
            guild: interaction.guildId,
            user: user
        })

        const hasLeveling = await GuildSchema.findOne({
            guild: interaction.guildId,
            leveling: "enabled"
        });

        if (!hasLeveling) {
            interaction.reply({
                content: 'This guild has leveling disabled.'
            })
            return;
        }

        if (!levelData) {
            interaction.reply({
                content: 'Couldn\'t retrieve user\'s information on levels. Try again.'
            })


            levelData = new LevelsSchema({
                guild: interaction.guildId,
                user: interaction.user.id,
                level: 0,
                xp: 0,
                totalXp: 0
            });
            await levelData.save();

            return;
        }

        const getRequiredXP = (level) => {
            if (level === 0) return 10;
            return Math.floor(10 * Math.pow(1.15, level - 1));
        };

        const nextLevel = levelData.level + 1;
        const requiredXP = getRequiredXP(nextLevel);
        const xpPercentage = Math.min((levelData.xp / requiredXP) * 100, 100);

        let embed = new EmbedBuilder()
            .setTitle(`${username}'s Level`)
            .setThumbnail(interaction.options.getUser('user').displayAvatarURL(
                { size: 256 }
            ))
            .setDescription(`**Level:** ${levelData.level}\n
                **XP:** ${levelData.xp}\n
                **Total XP:** ${levelData.totalXp}\n
                **Next Level:** ${nextLevel} (${xpPercentage.toFixed(2)}%)`)
            .setFooter({ text: 'Level' })
            .setColor('White')

        interaction.reply({
            embeds: [embed]
        })
    }
};
