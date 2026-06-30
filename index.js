require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

// Tiny HTTP server so Render knows the bot is alive
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent, // enable in dev portal too
  ]
});

const COMMANDS = [
  new SlashCommandBuilder()
    .setName('jizz')
    .setDescription('Sends a special image'),
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Register slash commands
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: COMMANDS });
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
});

const REACTIONS = [
  '💩', '🔥', '😂', '🗿', '💀', '😭', '🤨', '😳', '👀', '✅', '❌',
  '🪵', '🍆', '💦', '😤', '🙏', '🫵', '🥶', '🤣', '😈', '👹', '🤡',
  '💩', '✨', '⭐', '🌟', '💯', '🔞', '💅', '🙄', '😴', '🥴', '🤯',
  '🫠', '🥵', '🥶', '🤮', '🤑', '🤠', '🥷', '🫡', '😇', '🥳', '🤔',
  '😏', '😬', '🫥', '💪', '🖕', '👎', '👍', '🎉', '🎊', '🚀', '👽',
  '🤖', '👻', '💀', '☠️', '🫶', '💗', '🖤', '💘', '🔪', '🧨', '📉',
  '🍑', '👃', '🦶', '🧠', '🫀', '🦷', '👅', '🐶', '🐱', '🐭', '🐸',
  '🦍', '🪳', '🐛', '🦋', '🐌', '🌚', '🌝', '💨', '☄️', '⚡', '🌊',
  '🔥', '❄️', '🌈', '☀️', '⭐', '🌙', '🪐', '🎱', '🎲', '♟️', '🃏',
  '🀄', '🎯', '🏆', '🥇', '🥈', '🥉', '🛑', '🚫', '📛', '🔇', '🔕',
];

const AUTO_MESSAGE_USER = '369952399487664138'; // bot sends a message when this user talks
const AUTO_REACT_USER   = '696549280525320266'; // bot spams reactions when this user talks
const LITHO_USER        = '537679660776030229'; // bot flames this user on every message

// Specific user + specific message → specific reply
const TRIGGERED_REPLIES = [
  { userId: AUTO_REACT_USER, trigger: 'activate', reply: 'McCrackbot is activating there x gbtm' }
];

const LASTFM_USER = 'smushgoeman';
const CS_STEAM_ID = '76561199579756579';

// Fetch last played track from Last.fm
async function getLastPlayed(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  const track = data?.recenttracks?.track?.[0];
  if (!track) return null;
  return `${track.name} by ${track.artist['#text']}`;
}

// Fetch CS2 K/D from csstats.gg
async function getCSKD() {
  try {
    const res = await fetch(`https://csstats.gg/player/${CS_STEAM_ID}`);
    const html = await res.text();
    const kdMatch = html.match(/K\/D\s+([\d.]+)/);
    const killsMatch = html.match(/KILLS(\d+)/);
    const deathsMatch = html.match(/DEATHS(\d+)/);
    if (kdMatch) {
      const kd = kdMatch[1];
      const kills = killsMatch?.[1] || '?';
      const deaths = deathsMatch?.[1] || '?';
      return `KD ${kd} (${kills} kills, ${deaths} deaths)`;
    }
    return null;
  } catch (err) {
    console.error('csstats.gg error:', err);
    return null;
  }
}
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Auto-message for one user (sent as DM with last played track + CS stats)
  if (message.author.id === AUTO_MESSAGE_USER) {
    try {
      const [lastPlayed, csKD] = await Promise.all([
        getLastPlayed(LASTFM_USER),
        getCSKD(),
      ]);
      let dm = `fuckin prick`;
      if (lastPlayed) {
        dm += `\n ah here bai i know youve been listening to  **${lastPlayed}** fuckin shite tune that pal`;
      }
      if (csKD) {
        dm += `\n Also your CS2 stats: **${csKD}**`;
      }
      await message.author.send(dm);
    } catch {
      // can't DM if user has DMs disabled
    }
  }

  // Send react user their own last played track + CS stats
  if (message.author.id === AUTO_REACT_USER) {
    try {
      const [lastPlayed, csKD] = await Promise.all([
        getLastPlayed('activemccracken'),
        getCSKD(),
      ]);
      let dm = '';
      if (lastPlayed) {
        dm += `Your last played song was: **${lastPlayed}**\n`;
      }
      if (csKD) {
        dm += `Smushgoeman's CS2 stats: **${csKD}**`;
      }
      if (dm) await message.author.send(dm);
    } catch {
      // can't DM if user has DMs disabled
    }
  }

  // Flame litho user on every message
  if (message.author.id === LITHO_USER) {
    await message.channel.send('fuck back off to the military litho prick');
  }

  // Check triggered replies (message just needs to CONTAIN the trigger word)
  let wasTriggered = false;
  for (const rule of TRIGGERED_REPLIES) {
    if (message.author.id === rule.userId && message.content.toLowerCase().includes(rule.trigger.toLowerCase())) {
      await message.channel.send(rule.reply);
      wasTriggered = true;
    }
  }

  // Auto-react for another user (skip if a triggered reply already fired)
  if (message.author.id === AUTO_REACT_USER && !wasTriggered) {
    for (const emoji of REACTIONS) {
      try {
        await message.react(emoji);
      } catch {
        break;
      }
    }
  }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'jizz') {
    await interaction.reply('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUbcz-nNq7YDsOMTq_vXP3vg_ALEL2o5XVQv-T2wkxSw&s=10');
  }
});

client.login(process.env.DISCORD_TOKEN);