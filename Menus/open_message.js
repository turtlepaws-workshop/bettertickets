const jsh = require("discordjsh");
const util = require("discord.js-util");
const { generateTicketMenu } = require("../Modules/tickets");

module.exports = {
    data: new util.ContextMenuBuilder()
    .setName("Open Ticket")
    .setType("MESSAGE"),
    async execute(int, client){
        await int.reply({
            content: `**⚠️ Context Menu tickets on  messages are not available yet!**`,
            ephemeral: true
        });
        //await generateTicketMenu(int);
    }
}