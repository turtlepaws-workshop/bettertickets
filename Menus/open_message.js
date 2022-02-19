const jsh = require("discordjsh");
const util = require("discord.js-util");

module.exports = {
    data: new util.ContextMenuBuilder()
    .setName("Open Ticket")
    .setType("MESSAGE"),
    async execute(int, client){

    }
}