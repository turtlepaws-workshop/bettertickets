const { CommandInteraction, Client, MessageButton } = require("discord.js");
const jsh = require("discordjsh");
const { URL } = require("../Config/config");
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
        await int.reply({
            embeds: new Embed()
            .setTitle(`Welcome to BetterTickets`)
            .setDescription(`Hey there! Thanks for using BetterTickets, here's a quick tutorial on how to use BetterTickets!`)
            .build(),
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setStyle("LINK")
                        .setURL(URL.Website)
                        .setLabel(`Learn More`),
                        new MessageButton()
                        .setStyle("LINK")
                        .setURL(URL.Invite)
                        .setLabel(`Add BetterTickets`)
                    ]
                }
            ],
            ephemeral: true
        });
    }
}