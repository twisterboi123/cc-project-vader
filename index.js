require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== COMMANDS =====
const commands = [

  new SlashCommandBuilder()
    .setName('addpost')
    .setDescription('Post your TikTok')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('TikTok URL')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Admin test command')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// ===== REGISTER COMMANDS =====
(async () => {
  try {
    console.log('Registering commands...');
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log('Commands ready!');
  } catch (err) {
    console.error(err);
  }
})();

// ===== READY =====
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===== COMMAND HANDLER =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ===== ADDPOST =====
  if (interaction.commandName === 'addpost') {

    const link = interaction.options.getString('link');

    // only TikTok links
    if (!link.includes("tiktok.com")) {
      return interaction.reply({
        content: "❌ only TikTok links allowed",
        ephemeral: true
      });
    }

    const creatorRole = interaction.guild.roles.cache.get(process.env.CREATOR_ROLE_ID);
    const pingRole = interaction.guild.roles.cache.get(process.env.PING_ROLE_ID);

    // check creator role
    if (!creatorRole || !interaction.member.roles.cache.has(creatorRole.id)) {
      return interaction.reply({
        content: "❌ you are not a content creator",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xff0050)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle("🎬 New TikTok Upload")
      .setDescription(`[📱 Watch Video](${link})`)
      .setThumbnail("https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg")
      .setFooter({ text: "Project Vader" })
      .setTimestamp();

    await interaction.channel.send({
      content: `<@&${pingRole.id}>`,
      embeds: [embed]
    });

    await interaction.reply({
      content: "✅ posted!",
      ephemeral: true
    });
  }

  // ===== ADMIN TEST =====
  if (interaction.commandName === 'test') {
    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle("🧪 Test")
      .setDescription("bot working ✅")
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);