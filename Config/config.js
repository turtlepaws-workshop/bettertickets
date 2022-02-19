const { Client } = require("discord.js");
const Discord = require("discord.js");
const { Colors } = require("discordjsh");
const { clientID } = require("./config.json");

const WebsiteURL = module.exports.WebsiteURL = `https://tickets.trtle.xyz/`; //https://bettertickets.gg/ for the future!
const BetaBotID = "938640166820675585";
module.exports.Stem = "<:stem:944652606725324890>";
module.exports.Reply = "<:reply:944652576052371476>";
module.exports.InviteURL = WebsiteURL != null ? WebsiteURL + "invite" : ``;
module.exports.Color = clientID == BetaBotID ? "#D0473A" : Colors.BLURPLE;
module.exports.SupportURL = WebsiteURL != null ? WebsiteURL + "support" : ``;
module.exports.TestGuildID = `842575277249921074`;
/**
 * @type {Discord.InviteScope[]}
 */
module.exports.scopes = ["bot", "applications.commands"];
/**
 * @type {Discord.PermissionString[]}
 */
module.exports.permissions = ["SEND_MESSAGES", "SEND_MESSAGES_IN_THREADS", "MANAGE_ROLES", "MANAGE_CHANNELS", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "USE_EXTERNAL_STICKERS", "VIEW_CHANNEL"];
module.exports.URL = {
    Invite: this.InviteURL,
    Website: WebsiteURL
};

//No need to edit this (I think..)
/**
 * Creates an InviteURL
 * @param {Client} client 
 */
module.exports.GenerateInviteURL = (client) => {
    return client.generateInvite({
        permissions: this.permissions,
        scopes: this.scopes
    });
};
const FilterTypes = module.exports.FilterTypes = {
    "INTERACTION": "INTERACTION",
    "MESSAGE": "MESSAGE"
};
const FilterDef = module.exports.FilterDef = "INTERACTION" || "MESSAGE";
/**
 * Generates a filter
 * @param {FilterDef} type The type of filter
 * @param {String} matchId The userId to match
 * @returns {Discord.InteractionCollector | Discord.MessageCollector} The collector filter
 */
module.exports.generateDefualtFilter = (type, matchId) => {
    if(type == "INTERACTION"){
        return i => i.user.id == matchId;
    } else if(type == "MESSAGE"){
        return m => m.author.id == matchId;
    }
}