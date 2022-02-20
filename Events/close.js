const { CommandInteraction, Client, MessageButton, ButtonInteraction, Message } = require("discord.js");
const jsh = require("discordjsh");
const { URL } = require("../Config/config");
const { create, close } = require("../Modules/tickets");
const Embed = require("../Util/Embed");

module.exports = {
    name: jsh.Events.interactionCreate,
    /**
     * Executes the / command.
     * @param {ButtonInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client){
        if(!int.isButton()) return;

        const CustomIds = {
            "CLOSE": "TICKET_CLOSE",
            "CONFIRM": "TICKET_CLOSE_CONFIRM"
        }
        
        if(int.customId == CustomIds.CLOSE){
            /**@type {Message} */
            const Msg = await int.reply({
                embeds: new Embed()
                .setTitle(`Close Confirmation`)
                .setDescription(`Are you sure you want to close this ticket?`)
                .build(),
                components: [
                    {
                        type: 1,
                        components: [
                            new MessageButton()
                            .setLabel(`Close`)
                            .setStyle("DANGER")
                            .setCustomId(CustomIds.CONFIRM)
                        ]
                    }
                ],
                fetchReply: true
            });
            
            Msg.awaitMessageComponent()
            .then(async i => {
                if(i.customId == CustomIds.CONFIRM){
                    await close(i.channel.id, i);
                }
            });
        }
    }
}