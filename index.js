require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Auto-message for one user
  if (message.author.id === AUTO_MESSAGE_USER) {
    await message.channel.send(`${message.author.username} is a nonce`);
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

})

client.login(process.env.DISCORD_TOKEN);