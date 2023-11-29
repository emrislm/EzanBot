import { EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}
function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('-');
}

export async function getTimes() {
  let todayDate = formatDate(new Date());
  let url = `https://api.aladhan.com/v1/timingsByCity/${todayDate}?city=Houthalen&country=Belgium&method=13`;
  let response = await fetch(url);
  let json = await response.json();

  let justTimes = [
    {
      fullTime: json.data.timings.Sunrise,
      hour: json.data.timings.Sunrise.split(':')[0],
      minute: json.data.timings.Sunrise.split(':')[1]
    },
    {
      fullTime: json.data.timings.Dhuhr,
      hour: json.data.timings.Dhuhr.split(':')[0],
      minute: json.data.timings.Dhuhr.split(':')[1]
    },
    {
      fullTime: json.data.timings.Asr,
      hour: json.data.timings.Asr.split(':')[0],
      minute: json.data.timings.Asr.split(':')[1]
    },
    {
      fullTime: json.data.timings.Maghrib,
      hour: json.data.timings.Maghrib.split(':')[0],
      minute: json.data.timings.Maghrib.split(':')[1]
    },
    {
      fullTime: json.data.timings.Isha,
      hour: json.data.timings.Isha.split(':')[0],
      minute: json.data.timings.Isha.split(':')[1]
    }
  ]

  return {
    justTimes,
    embedsData: {
      embeds: [new EmbedBuilder()
        .setTitle('Namaz vakitleri')
        .setColor('DarkGreen')
        .setFields(
          { name: 'Sabah', value: json.data.timings.Sunrise, inline: true },
          { name: 'Oglen', value: json.data.timings.Dhuhr, inline: true },
          { name: 'Ikindi', value: json.data.timings.Asr, inline: true },
          { name: 'Aksam', value: json.data.timings.Maghrib, inline: true },
          { name: 'Yatsi', value: json.data.timings.Isha, inline: true }
        )
      ]
    }
  }
}