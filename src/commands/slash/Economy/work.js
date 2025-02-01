const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

var cooldown = [];

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for 500-1500 Moonshard'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        let economy = await EconomySchema.findOne({
            guild: interaction.guildId,
            user: interaction.member.user.id
        })

        if (cooldown.includes(interaction.member.user.id)) {
            interaction.reply({
                content: 'This command has a 30 minute cooldown.'
            })
            return;
        }

        if (!economy) {
            interaction.reply({
                content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
            })
            return
        } else {
            const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')

            let balance = economy.balance

            let job = economy.job

            const randomAmount = 500 + Math.floor(Math.random() * 1001)

            if (job.startsWith('unemployed')) {
                interaction.reply({
                    content: 'You need to apply for a job first. Use ```/job apply``` to apply for a job.'
                })
                return
            } else {
                let requiredItem;
                let jobDescription;
        
                if (job.startsWith('fisherman')) {
                    requiredItem = 'fishing rod';
                    jobDescription = `You fish a workday long and get paid ${randomAmount} Moonshard ${Moonshard}.`;
                } else if (job.startsWith('archeologist')) {
                    requiredItem = 'shovel';
                    jobDescription = `You dig up expensive ancient relics and sell them for ${randomAmount} Moonshard ${Moonshard}.`;
                } else if (job.startsWith('hunter')) {
                    requiredItem = 'axe';
                    jobDescription = `You hunt animals and get ${randomAmount} Moonshard ${Moonshard} for your work.`;
                } else if (job.startsWith('artist')) {
                    requiredItem = 'paint brush';
                    jobDescription = `You paint a beautiful painting and get ${randomAmount} Moonshard ${Moonshard} for your work.`;
                } else if (job.startsWith('streamer')) {
                    requiredItem = 'computer';
                    jobDescription = `You start a live stream and get ${randomAmount} Moonshard ${Moonshard} donated by your viewers.`;
                }
        
                const hasItem = economy.items.includes(requiredItem);
        
                if (!hasItem) {
                    interaction.reply({
                        content: `You can only work your job as a ${job} if you have a ${requiredItem}. Buy one using \`/shop buy\`.`
                    });
                    return;
                }
        
                const updatedBalance = balance + randomAmount;
        
                await EconomySchema.findOneAndUpdate(
                    {
                        guild: interaction.guildId,
                        user: interaction.member.user.id
                    },
                    {
                        balance: updatedBalance
                    }
                );
        
                let embed = new EmbedBuilder()
                    .setTitle('You work your job')
                    .setDescription(jobDescription)
                    .setFooter({ text: 'Job work' })
                    .setColor('White');
        
                await interaction.reply({
                    embeds: [embed]
                });
        
                cooldown.push(interaction.member.user.id);
                setTimeout(() => {
                    cooldown.shift();
                }, 1800 * 1000);
            }
        }
    }
};