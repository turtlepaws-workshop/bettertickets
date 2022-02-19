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
            CategoryId: null,
            Remove: {
                PingRoles: false,
                Managers: false
            }
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

    async removePingRole(Id){
        this.config.Remove.PingRoles = true
        const data = await this._fetch();
        this.config.PingRoles = data.PingRoles.filter(e => e != (Id?.id != null ? Id.id : Id))
        return this;
    }

    async removeManagerRole(Id){
        this.config.Remove.Managers = true
        const data = await this._fetch();
        this.config.ManagerRoles = data.ManagerRoles.filter(e => e != (Id?.id != null ? Id.id : Id))
        return this;
    }

    addPingRole(Ids) {
        for(const id of Ids) this.config.PingRoles.push(id?.id != null ? id.id : id)
        return this;
    }

    addManagerRole(Ids) {
        for(const id of Ids) this.config.ManagerRoles.push(id?.id != null ? id.id : id)
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
        function notNull(val, embed){
            return val != null;
        }
        const fetched = await this._fetch();

        if (!fetched || (fetched == null)){
            return (await this._create());
        }

        fetched.guildId = this.guildId;
        if(notNull(this.config.CategoryId)) fetched.categoryId = this.config.CategoryId;
        if(notNull(this.config.Embed.Description)) fetched.Embed.description = this.config.Embed.Description;
        if(notNull(this.config.Embed.Color)) fetched.Embed.color = this.config.Embed.Color;
        if(notNull(this.config.Embed.Title)) fetched.Embed.title = this.config.Embed.Title;
        if(fetched.PingRoles == null) fetched.PingRoles = [];
        if(fetched.ManagerRoles == null) fetched.ManagerRoles = [];
        if(!this.config.Remove.PingRoles) {
            this.config.PingRoles.forEach(e => {
                fetched.PingRoles.push(e);
            });
        } else {
            fetched.PingRoles = this.config.PingRoles;
        }
        if(!this.config.Remove.Managers) {
            this.config.ManagerRoles.forEach(e => {
                fetched.ManagerRoles.push(e);
            });
        } else {
            fetched.ManagerRoles = this.config.ManagerRoles;
        }

        return (await fetched.save().catch(console.log));
    }
}