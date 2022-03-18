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
            .addField(`➜ Getting Started`, `BetterTickets works by using ticket panels and manager roles. For example if you would like a ticket embed with buttons you can create a panel or if want to have your moderators managing tickets you can add them as a manager.`)
            .addField(`➜ Config`, `All server configuration is in \`/server\` working with buttons.`)
            .addField(`➜ Creating Ticket Panels`, `You can create a ticket panel by using the command \`/panel create\` and following the instructions. To remove a ticket panel simply right-click on the message and click \`Delete\`!`)
            .addField(`➜ Notes`, `\`/embed\` and \`/button\` is **only** used when you create a ticket panel, if it says \`Interaction Failed\` that is normal.`)
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
                        .setURL(URL.Support)
                        .setLabel(`Support Server`),
                        new MessageButton()
                        .setStyle("LINK")
                        .setURL(URL.Invite)
                        .setLabel(`Add to Server`)
                    ]
                }
            ],
            ephemeral: true
        });
    }
}