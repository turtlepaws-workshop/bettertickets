const { CommandInteraction, Client, MessageButton } = require("discord.js");
const jsh = require("discordjsh");
const { URL } = require("../Config/config");
const Embed = require("../Util/Embed");

module.exports = {
    data: new jsh.commandBuilder()
    .setName(`embed`)
    .setDescription(`Create an embed for the ticket panel.`),
    /**
     * Executes the / command.
     * @param {CommandInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client) { }
}