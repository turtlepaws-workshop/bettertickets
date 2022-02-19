const { CommandInteraction, Client } = require("discord.js");
const jsh = require("discordjsh");
const Embed = require("../Util/Embed");

module.exports = {
    data: new jsh.commandBuilder()
    .setName(`help`)
    .setDescription(`Get to know BetterTickets.`),
    /**
     * Executes the / command.
     * @param {CommandInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client){

    }
}