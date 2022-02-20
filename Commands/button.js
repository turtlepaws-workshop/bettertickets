const { CommandInteraction, Client, MessageButton } = require("discord.js");
const jsh = require("discordjsh");
const { URL } = require("../Config/config");
const Embed = require("../Util/Embed");

module.exports = {
    devOnly: true,
    data: new jsh.commandBuilder()
    .setName(`button`)
    .setDescription(`Create a new button when using a ticket panel.`)
    .addStringOption(e => e.setName(`label`).setDescription(`The label.`))
    .addStringOption(e => e.setName(`emoji`).setDescription(`The emoji.`))
    .addStringOption(e => e.setName(`style`).setDescription(`The style.`).addChoices([
        [`Blurple/Primary`, `PRIMARY`],
        [`Grey/Secondary`, `SECONDARY`],
        [`Red/Danger`, `DANGER`],
        [`Green/Success`, `SUCCESS`]
    ])),
    /**
     * Executes the / command.
     * @param {CommandInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client) { }
}