const jsh = require("discordjsh");
const util = require("discord.js-util");
const { generateTicketMenu } = require("../Modules/tickets");

module.exports = {
    data: new util.ContextMenuBuilder()
    .setName("Open Ticket")
    .setType("USER"),
    async execute(int, client){
        await generateTicketMenu(int);
    }
}