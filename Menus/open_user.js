const jsh = require("discordjsh");
const util = require("discord.js-util");

module.exports = {
    data: new util.ContextMenuBuilder()
    .setName("Open Ticket")
    .setType("USER"),
    async execute(int, client){

    }
}