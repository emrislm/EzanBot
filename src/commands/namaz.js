import { SlashCommandBuilder } from "discord.js";

const namazCommand = new SlashCommandBuilder()
  .setName('namaz')
  .setDescription('Bugunku namaz vakitleri.');

export default namazCommand.toJSON();