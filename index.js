require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// 1. הגדרת פקודת הסלאש (/drop) עם שדה prize
const commands = [
    new SlashCommandBuilder()
        .setName('drop')
        .setDescription('התחלת דרופ חדש בערוץ')
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('מה הסטאטוס/פרס שרוצים לחלק?')
                .setRequired(true)
        )
];

// 2. רישום הפקודה מול דיסקורד בעת התחברות הבוט
client.once('ready', async () => {
    console.log(`🤖 הבוט ${client.user.tag} מחובר ומוכן לפעולה!`);
    client.user.setActivity('By kobranest', { type: ActivityType.Listening });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('מעדכן פקודות Slash בשרתים...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✅ פקודת /drop נרשמה בהצלחה!');
    } catch (error) {
        console.error('שגיאה ברישום הפקודות:', error);
    }
});

// 3. טיפול בפקודת ה-Slash
client.on('interactionCreate', async (interaction) => {
    // טיפול ב-Slash Command
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'drop') {
            // קבלת הפרס שהשתמש רשם בשדה prize
            const prize = interaction.options.getString('prize');

            const dropEmbed = new EmbedBuilder()
                .setTitle('🎉 דרופ חדש באוויר')
                .setDescription(`הראשון שלוחץ על הכפתור למטה זוכה בפרס!\n\n🎁 **הפרס:** ${prize}\n\nבואו נראה מי לוחץ 🔥`)
                .setColor('#2ecc71')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL());

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim_drop_${prize}`)
                    .setLabel('לתפוס 🎯')
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ embeds: [dropEmbed], components: [row] });
        }
    }

    // טיפול בלחיצה על הכפתור "לתפוס"
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('claim_drop_')) {
            const prize = interaction.customId.replace('claim_drop_', '');

            const wonEmbed = new EmbedBuilder()
                .setTitle('🏆 ה-DROP נתפס!')
                .setDescription(`כל הכבוד ל- <@${interaction.user.id}> שזכה בפרס: **${prize}**! 🎉`)
                .setColor('#6b0700')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            await interaction.update({ embeds: [wonEmbed], components: [] });

        }
    }
});



client.login(process.env.DISCORD_TOKEN);