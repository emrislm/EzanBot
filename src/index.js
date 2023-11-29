import { config } from 'dotenv';
import cron from 'node-cron';
import { REST, Client, GatewayIntentBits, Routes, IntentsBitField } from "discord.js";
import { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';

import NamazCommand from './commands/namaz.js';
import TestCommand from './commands/test.js';
import { getTimes } from './API/getTimes.js';

config();
const TOKEN = process.env.EZANBOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.HY_GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, IntentsBitField.Flags.GuildVoiceStates] });
const rest = new REST({ version: '10' }).setToken(TOKEN);
let guild = null;

/////////////////////////////////////////////// CLIENT ///////////////////////////////////////////////
client.on('ready', async () => {
  console.log(`${client.user.username} is online.`);
  guild = await client.guilds.fetch(GUILD_ID);
  let dateNow = new Date();
  let cronExpressions = [];
  let cronjobList = [];
  let prayerTimes = [];
  let prayerTimesTEST = [];
  let prayerTimesRestOfDay = [];

  console.log('Today:', dateNow.toLocaleString('nl-BE'));

  // on startup, get times for today and calculate cronjobs
  let timesTable = (await getTimes()).justTimes;
  console.log(timesTable);

  timesTable.forEach(time => {
    const prayerTime = new Date(dateNow);
    prayerTime.setHours(time.hour, time.minute, 0, 0);
    prayerTimes.push(prayerTime);
    cronExpressions.push(`${time.minute} ${time.hour} * * *`);
  });

  // check which prayertime is left for today (on bot ready (reset))
  prayerTimesTEST = [
    new Date('2023-11-22T21:45:00.000Z'),
  ];
  prayerTimes.forEach(time => {
    if (dateNow <= time) prayerTimesRestOfDay.push(time);
  });

  // set cronjobs for todays prayers
  cronjobList = handleCronjobsForToday(prayerTimesRestOfDay);
  console.log('Amount of prayers left today:', cronjobList.length);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'namaz') {
    let timesTable = await getTimes();
    await interaction.reply(timesTable.embedsData);
  }
  if (interaction.commandName === 'test') {
    await interaction.reply('Ezan test ediliyor!!');
    playEzan(guild);
  }
});

/////////////////////////////////////////////// METHODS //////////////////////////////////////////////
async function main() {
  const commands = [
    NamazCommand,
    TestCommand
  ];

  try {
    console.log("Started refreshing commands.");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    client.login(TOKEN);
  } catch (error) {
    console.log(error);
  }
}

function handleCronjobsForToday(remainingPrayerTimesToday) {
  let list = [];
  remainingPrayerTimesToday.forEach(time => {
    //let time = new Date(prayerTime);
    let job = cron.schedule(`${time.getMinutes()} ${time.getHours()} * * *`, () => {
      console.log('Namaz vakti!', new Date().toLocaleString('nl-BE'));
      playEzan(guild);
    });
    list.push(job);
  });

  return list;
}

function playEzan(guild) {
  console.log('Ezan is playing!');

  // voice channel ids
  const HY_voiceChannel = '533989995053318174';
  const BT_voiceChannel = '1175790323121786963';

  // create audio player
  const player = createAudioPlayer();
  player.on(AudioPlayerStatus.Playing, () => { console.log('Is playing...') });
  player.on('error', error => { console.log(`Error: ${error} with resource...`) });

  // create and play audio
  let audioPath = 'C:\\Users\\Itseiji\\Documents\\Emir\\Z_etc\\DC\\dc bots\\ezanBot\\src\\audio\\ezan.mp3';
  let resource = createAudioResource(audioPath);

  const voiceChannel = HY_voiceChannel;
  const voiceConnection = joinVoiceChannel({
    channelId: voiceChannel,
    guildId: GUILD_ID,
    adapterCreator: guild.voiceAdapterCreator
  });

  // subscribe the connection to the audio player
  const subscription = voiceConnection.subscribe(player);
  player.play(resource);

  // unsubscribe after x sec
  if (subscription) {
    setTimeout(() => {
      subscription.unsubscribe();
      voiceConnection.destroy();
      console.log('Ezan is done playing. Disconnecting bot.');
    }, 20_000);
  }
}

/////////////////////////////////////////////// BASE /////////////////////////////////////////////////
main();