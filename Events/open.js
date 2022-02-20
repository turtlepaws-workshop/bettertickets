const { CommandInteraction, Client, MessageButton, ButtonInteraction } = require("discord.js");
const jsh = require("discordjsh");
const { URL } = require("../Config/config");
const { create } = require("../Modules/tickets");
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
            "OPEN": 36
        }

        if(int.customId.length == CustomIds.OPEN){
            await create(int.member, int);
        }
    }
}