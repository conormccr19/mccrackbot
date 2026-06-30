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

// Specific user + specific message → specific reply
const TRIGGERED_REPLIES = [
  { userId: 'AUTO_REACT_USER', trigger: 'activate', reply: 'McCrackbot is activating there x gbtm' }

];

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Auto-message for one user
  if (message.author.id === AUTO_MESSAGE_USER) {
    await message.channel.send(`${message.author.username} is a nonce`);
  }

  // Check triggered replies
  for (const rule of TRIGGERED_REPLIES) {
    if (message.author.id === rule.userId && message.content.toLowerCase() === rule.trigger.toLowerCase()) {
      await message.channel.send(rule.reply);
    }
  }

  // Auto-react for another user
  if (message.author.id === AUTO_REACT_USER) {
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