const jsh = require("discordjsh");
const util = require("discord.js-util");
const { FixTicketPanel } = require("../Modules/tickets");

module.exports = {
    devOnly: true,
    data: new util.ContextMenuBuilder()
    .setName("Fix Panel")
    .setType("MESSAGE"),
    async execute(int, client){
        await int.reply({
            content: `**⚠️ This will make the panel compatible with context menu tickets!**`,
            ephemeral: true
        });

        await FixTicketPanel(int.options.getMessage("message")).then(async (err) => {
            if(err.err){
                return int.followUp({
                    content: err.message,
                    ephemeral: true
                });
            }
            
            await int.followUp({
                content: `**✅ Ticket Panel now compatible with context menu tickets!**`,
                ephemeral: true
            });
        })
    }
}