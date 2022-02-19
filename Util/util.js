const Discord = require("discord.js");
const { Color: color } = require("../Config/config");
const emojis = require('../emojis.json');

module.exports.categoryEmojis = {
    "Bot": "<:bot_add:863464329738715156>",
    "Discord.js": "<:djs:895374013629599806>",
    "Emojis": "<:reaction_add:863474840726929449>",
    "Fun": "<a:atada:869705649846616104>",
    "Mod": "<:ban:863529097283240016>",
    "Misc": "<:channel_add:863464329755361350>",
    "Slash_Command": "<:slashCommand:872317151451705385>",
    "Rule_Book": "<:rules:890070276094713906>",
    "Pencil": "<:pencil:887514200614780939>",
    "Member_Add": "<:member_invited:887514198651830292>",
    "Error": "<:failed:899071447811624980>"
}

/**
 * Replys with an error.
 * @param {String} message The message to say.
 * @param {Discord.Interaction|Discord.Message} interaction The interaction can be a component or a command.
 * @param {"REPLY" | "UPDATE"} replyType If it should reply or edit.
 * @param {Boolean} ephemeral If the interaction reply should be hidden
 */
 module.exports.errorMessage = (message, interaction, replyType="REPLY", ephemeral=true) => {
    const text = this.categoryEmojis.Error + " " + message
    if(interaction?.author){
        interaction.channel.send(text)
    } else {
    if(interaction.isMessageComponent()){
        if(replyType === "REPLY"){
            interaction.reply({ content: text, ephemeral: ephemeral });
        } else if(replyType === "UPDATE"){
            interaction.update({ content: text });
        }
    } else if(interaction.isCommand()){
        if(replyType === "REPLY"){
            interaction.reply({ content: text, ephemeral: ephemeral });
        } else if(replyType === "UPDATE"){
            interaction.editReply({ content: text });
        }
    }
}
}

/**
 * Splits buttons into action rows.
 * @param {Discord.MessageButton[]|Discord.MessageButton} buttons 
 * @returns {Discord.MessageActionRow}
 */
module.exports.formatButtons = (buttons) => {
    if(!Array.isArray(buttons)) buttons = [buttons]
    const rows=[new Discord.MessageActionRow()];
    let row = 0;
    let btn = 0;
    for(const button of buttons){
        if(btn === 5){
            rows.push(new MessageActionRow())
            row++
        }
        if(row === 5){
            break
        }
        
        rows[row].addComponents(button)
        btn++
    }
    return rows
}

/**
 * Checks if a member has a permission if they don't the bot will reply/edit to the interaction.
 * @param {Discord.PermissionString} permission 
 * @param {Discord.CommandInteraction} interaction 
 */
module.exports.checkPermissions = async (permission, interaction, customEmbed) => {
    const hasPerms = interaction.member.permissions.has(permission);

    const embed = customEmbed || new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`${emojis.mod_dc} | Invalid permissions`)
        .setDescription(`You must have the \`${permission}\` permission to use this command!`)

    if (!hasPerms) {
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        return false;
    } else return true;
}

module.exports.createEmbedFromText = (text) => {
    return new Discord.MessageEmbed()
        .setDescription(text)
        .setColor(color)
}

/**
 * Creates a link button.
 * @param {String} link 
 * @param {Object} options 
 * @param {String} [options.text]
 * @param {String} [options.emoji]
 */
module.exports.createLinkButton = (link, options) => {
    return new Discord.MessageButton()
    .setStyle("LINK")
    .setLabel(options.text)
    .setEmoji(options.emoji)
    .setURL(link)
}
module.exports.counter = class Counter {
    constructor() {
        /**
         * The count on the counter.
         * @type {Number}
         * @readonly
         */
        this.count = 0;

        /**
         * The max count on the counter.
         * @type {Number}
         */
        this.maxCount = 0;

        /**
         * The emoji for the button.
         * @type {String}
         */
        this.emoji = null;
    }

    /**
     * Sets the emoji for the button.
     * @param {String} emoji 
     * @returns {Counter}
     */
    setEmoji(emoji) {
        if (!emoji) throw new TypeError(`emoji is a required arg.`)
        if (typeof emoji !== "string") throw new TypeError(`emoji must be a number.`)

        this.emoji = emoji
        return emoji;
    }

    /**
     * Sets the max count on the counter.
     * @param {Number} count 
     * @returns {Counter}
     */
    setMaxCount(count) {
        if (!count) throw new TypeError(`count is a required arg.`)
        if (typeof count !== "number") throw new TypeError(`count must be a number.`)

        this.maxCount = count
        return this;
    }

    /**
     * Creates the buttons for the counter.
     * @returns {Discord.MessageButton}
     */
    createButtons() {
        return new Discord.MessageButton()
            .setCustomId("count-do-not-touch")
            .setDisabled(true)
            .setEmoji(this.emoji)
            .setLabel(`${this.count}/${this.maxCount}`)
            .setStyle("SECONDARY");
    }

    /**
     * Adds numbers to the counter and updates button.
     * @param {Discord.Message} message
     */
    async addCount(message) {
        if (!message) throw new TypeError(`message is a required arg.`)

        this.count++

        await message.edit({ components: [new Discord.MessageActionRow().addComponents(this.createButtons())] });
    }
}

/**
 * 
 * @param {Discord.MessageActionRow} row 
 */
module.exports.disableButtons = (row) => {
    for(const button of row.components){
        button.setDisabled(true)
    }
    return row;
}

/**
 * @param {String} text
 */
 module.exports.fixText = (text) => {
    //Check to make sure everything is right
    if (!text) throw new TypeError("`text` is a required arg and is missing");
    if (typeof text != "string") throw new TypeError("`text` must be a `string`");

    //Make this a string
    text = text.toString();

    //Get the first letter and get the other text
    let newText = text.slice(1, text.length);
    let oldText = text.slice(0, 1);

    //Merge them and make the first letter upper case
    let returnedText = oldText.toUpperCase() + newText;

    //Remove `_` and `-`
    returnedText = returnedText.replaceAll(`_`, ` `).replaceAll(`-`, ` `)

    //Return the final text
    return `${returnedText}`;
}