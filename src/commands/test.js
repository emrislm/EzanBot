import { SlashCommandBuilder } from "discord.js";

const ezanCommand = new SlashCommandBuilder()
  .setName('test')
  .setDescription('Ezani test et');

export default ezanCommand.toJSON();