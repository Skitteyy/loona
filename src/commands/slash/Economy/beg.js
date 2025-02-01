const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const EconomySchema = require('../../../schemas/EconomySchema');

var cooldown = [];

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Beg for potentially 1-500 Moonshard'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {[]} args 
     */
    run: async (client, interaction, args) => {
        if (cooldown.includes(interaction.member.user.id)) {
            interaction.reply({
                content: 'This command has a one minute cooldown.'
            })
            return;
        }

        const Moonshard = client.emojis.cache.find(emoji => emoji.id === '1157656742990204998')

        let economy = await EconomySchema.findOne({
            guild: interaction.guildId,
            user: interaction.member.user.id
        })

        if (!economy) {
            interaction.reply({
                content: 'You need to create an economy account first. Use ```/economy create``` to create an economy account.'
            })
            return
        }

        let balance = economy.balance

        const randomAmount = Math.floor(Math.random() * 500 + 1)

        const success = [
            `You started begging for money when a stone fell on your head, you look down at the stone and find ${randomAmount} Moonshard ${Moonshard} next to it!`,
            `You thought about begging when a voice called: "${interaction.member.user.username}, stop it. No one likes beggars." and you got ${randomAmount} Moonshard ${Moonshard} all of a sudden.`,
            `Okay here is ${randomAmount} Moonshard ${Moonshard}.`,
            `I will give you ${randomAmount} Moonshard ${Moonshard} to shut up.`,
            `Fine...\n/give ${interaction.member.user.username} economy:Moonshard ${randomAmount}`,
            `You beg and a bag with ${randomAmount} Moonshard ${Moonshard} lands in front of you. Wow!`,
            `You start crying "Oh please! Please! I need money, please!" and the universe gives you ${randomAmount} Moonshard ${Moonshard}.`,
            `\`\`\`//Update user balance.\nawait EconomySchema.find({\nguild: interaction.guildId,\nuser: interaction.member.user.username\n}).updateOne({\nbalance: economy.balance + randomAmount\n})\`\`\`\n+ ${randomAmount} Moonshard ${Moonshard}`,
            `Aw, you poor thing! Here is ${randomAmount} Moonshard ${Moonshard}.`,
            `You go up to a rich looking man and ask him for money, he turns around to face you and throws ${randomAmount} Moonshard ${Moonshard} directly in your face.`,
        ];

        const failure = [
            `${interaction.member.user.username}, stop.`,
            `No.`,
            `Try again.`,
            `Hmmm, uhhh, wait a second... mmm no.`,
            `Maybe some other time.`,
            `Don't feel like it.`,
            `You would've gotten ${randomAmount} Moonshard ${Moonshard} from me today but your begging disgusts me, so you get none.`,
            `You go up to a kid to ask for money, but before you spoke you choked on oxygen and died.`,
            `error`,
            `I was taught not to talk to strangers.`,
            `Sorry I'm busy laughing at you right now.`
        ];

        const randomSuccess = Math.floor(Math.random() * success.length);
        const randomFailure = Math.floor(Math.random() * failure.length);

        let embed = new EmbedBuilder()
            .setTitle(`${interaction.member.user.username} needs money`)
            .setDescription('placeholder')
            .setFooter({ text: 'Begging' })
            .setColor('White');

        async function handling() {
            if (Math.random() <= 0.4) {
                embed.setDescription(`${failure[randomFailure]}`)
                return;
            } else {
                const updatedBalance = balance + randomAmount;
                await EconomySchema.find({
                    guild: interaction.guildId,
                    user: interaction.member.user.id
                }).updateOne({
                    balance: updatedBalance
                })

                const getApple = Math.random() <= 0.2

                if (getApple) {
                    await EconomySchema.find({
                        guild: interaction.guildId,
                        user: interaction.member.user.id
                    }).updateOne({
                        $push: { items: 'apple' }
                    })

                    embed.setDescription(`${success[randomSuccess]}\n\nWould you look at that! You got an apple :apple:!`)
                } else {
                    embed.setDescription(success[randomSuccess]);
                }
                return;
            }
        }

        await handling();

        interaction.reply({
            embeds: [embed]
        });

        cooldown.push(interaction.member.user.id);
        setTimeout(() => {
            cooldown.shift();
        }, 60 * 1000);
    }
};
