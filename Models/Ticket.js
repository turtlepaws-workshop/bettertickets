const { Emoji, GuildMember, Client, GuildEmoji } = require('discord.js');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    //ID's
    guildId: String,
    ticketId: String,
    userId: String,
    channelId: String,
    //Messages
    usersInTicket: [String],
    messages: [String],
    //Info
    dateCreated: Number,
    dateClosed: String,
    open: Boolean,
});

const Model = module.exports.Model = mongoose.model(`tickets`, schema)