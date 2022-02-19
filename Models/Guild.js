const { Emoji, GuildMember, Client, GuildEmoji } = require('discord.js');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    //ID's
    guildId: String,
    //Settings
    categoryId: String,
    Embed: {
        description: String,
        title: String,
        color: String
    },
    PingRoles: [String],
    ManagerRoles: [String]
});

const Model = module.exports.Model = mongoose.model(`guilds`, schema)