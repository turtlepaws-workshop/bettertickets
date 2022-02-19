const { GuildMember, PermissionOverwrites, MessageEmbed } = require("discord.js");
const { Model } = require("../Models/Ticket");
const { Model: GuildModel } = require("../Models/Guild");
const { v4: uuid } = require("uuid");
const { Color } = require("../Config/config");

module.exports.defaultIds = {
    "CLOSE": "CLOSE_TICKET"
};

/**
 * Creates a new ticket.
 * @param {GuildMember} member 
 */
module.exports.create = async (member) => {
    const AllTickets = await Model.find({
        guildId: member.guild.id
    });
    const Guild = await GuildModel.findOne({
        guildId: member.guild.id
    });

    const Channel = await member.guild.channels.create(`ticket-${AllTickets.length || 1}`, {
        reason: `Ticket opened by ${member.user.tag} (${member.id})`,
        parent: Guild.categoryId,
        permissionOverwrites: [
            {
                id: member.guild.roles.everyone.id,
                deny: ["VIEW_CHANNEL"]
            },
            {
                id: member.id,
                allow: ["VIEW_CHANNEL"]
            }
        ]
    });

    const ID = uuid();

    const Saved = await new Model({
        //ID's
        guildId: member.guild.id,
        ticketId: ID,
        userId: member.id,
        channelId: Channel.id,
        //Messages
        usersInTicket: [member.id],
        messages: ["<HelloMessage>"],
        //Info
        dateCreated: Date.now(),
        dateClosed: null,
        open: true
    }).save().catch(console.log);

    const Message = await Channel.send({
        embeds: [
            this.generateHelloMessage(Guild)
        ]
    });

    return {
        Saved,
        ID,
        Channel,
        Message
    }
};

module.exports.close = async () => {

};

module.exports.generateHelloMessage = async (Guild) => {
    return new MessageEmbed()
        .setColor(Guild?.Embed?.color || Color)
        .setTitle(Guild?.Embed?.title || `Hey there!`)
        .setDescription(Guild?.Embed?.description || `Thank you for contacting support today, how can we help?`);
}

module.exports.recordMessage
module.exports.setGuildSettings

module.exports.guildSettings = class GuildSettings {
    constructor() {
        this.guildId = null;

        this.config = {
            Embed: {
                Color: null,
                Description: null,
                Title: null
            },
            PingRoles: [],
            ManagerRoles: [],
            CategoryId: null
        };
    }

    setGuildID(Id) {
        this.guildId = Id
        return this;
    }

    setCategoryId(Id) {
        this.config.CategoryId = Id
        return this;
    }

    addPingRole(Id) {
        this.config.PingRoles.push(Id)
        return this;
    }

    addManagerRole(Id) {
        this.config.ManagerRoles.push(Id)
        return this;
    }

    setEmbedTitle(text) {
        this.config.Embed.Title = text
        return this;
    }

    setEmbedDescription(text) {
        this.config.Embed.Description = text
        return this;
    }

    setEmbedColor(color) {
        this.config.Embed.Color = color
        return this;
    }

    async _fetch() {
        return (await GuildModel.findOne({
            guildId: this.guildId
        }));
    }

    async _create() {
        const ModelCreated = await new GuildModel({
            guildId: this.guildId,
            categoryId: this.config.CategoryId,
            Embed: {
                description: this.config.Embed.Description,
                title: this.config.Embed.Title,
                color: this.config.Embed.Color
            },
            PingRoles: this.config.PingRoles,
            ManagerRoles: this.config.ManagerRoles
        }).save().catch(console.log);

        return ModelCreated;
    }

    async save() {
        const fetched = await this._fetch();

        if (!fetched || (fetched == null)){
            return (await this._create());
        }

        fetched.guildId = this.guildId;
        fetched.categoryId = this.config.CategoryId;
        fetched.Embed = {
            description: this.config.Embed.Description,
            title: this.config.Embed.Title,
            color: this.config.Embed.Color
        };
        fetched.PingRoles = this.config.PingRoles;
        fetched.ManagerRoles = this.config.ManagerRoles;

        return (await fetched.save().catch(console.log));
    }
}