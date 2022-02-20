const { GuildMember, PermissionOverwrites, MessageEmbed, TextChannel, MessageButton, ButtonInteraction } = require("discord.js");
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
 * @param {ButtonInteraction} int
 */
module.exports.create = async (member, int) => {
    const AllTickets = await Model.find({
        guildId: member.guild.id
    });
    const GuildSettings = new this.guildSettings()
    .setGuildID(member.guild.id);

    const permissionOverwrites = [
        {
            id: member.guild.roles.everyone.id,
            deny: ["VIEW_CHANNEL"]
        },
        {
            id: member.id,
            allow: ["VIEW_CHANNEL"]
        },
       
    ];

    await (await GuildSettings.getManagerRoles()).map(e => {
        permissionOverwrites.push({
            id: e,
            allow: ["VIEW_CHANNEL"]
        });
    })

    const Channel = await member.guild.channels.create(`ticket-${AllTickets.length || 1}`, {
        reason: `Ticket opened by ${member.user.tag} (${member.id})`,
        parent: await (await GuildSettings._fetch()).categoryId,
        permissionOverwrites
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

    if(int){
        int.reply({
            ephemeral: true,
            content: `Created a ticket in ${Channel}`
        });
    }
    
    const PingRoless = await GuildSettings.getPingRoles();
    const Message = await Channel.send({
        content: PingRoless.map(e => `<@&${e}>`).join(" "),
        embeds: [
            await this.generateHelloMessage(GuildSettings)
        ],
        components: [
            {
                type: 1,
                components: [
                    new MessageButton()
                    .setLabel(`Close`)
                    .setStyle("DANGER")
                    .setCustomId(`TICKET_CLOSE`),
                ]
            }
        ]
    });

    return {
        Saved,
        ID,
        Channel,
        Message
    }
};

module.exports.close = async (ChannelID, i) => {
    const Ticket = await Model.findOne({
        channelId: ChannelID
    });

    Ticket.open = false;
    Ticket.dateClosed = Date.now();

    Ticket.save().catch(console.log);

    await i.channel.delete();
};

const helloMessageEmbed = module.exports.generateHelloMessage = async (Guild) => {
    if(Guild?._fetch != null) Guild = await Guild._fetch();
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
            },
            TicketPanels: []
        };
    }

    /**
     * @returns {Promise<String[]>}
     */
    async getManagerRoles(){
        const d = await this._fetch();
        return d.ManagerRoles;
    }

    /**
     * @returns {Promise<String[]>}
     */
    async getPingRoles(){
        const d = await this._fetch();
        return d.PingRoles;
    }

    setGuildID(Id) {
        this.guildId = Id
        return this;
    }

    setCategoryId(Id) {
        this.config.CategoryId = Id
        return this;
    }

    async removePingRole(Id) {
        this.config.Remove.PingRoles = true
        const data = await this._fetch();
        this.config.PingRoles = data.PingRoles.filter(e => e != (Id?.id != null ? Id.id : Id))
        return this;
    }

    async removeManagerRole(Id) {
        this.config.Remove.Managers = true
        const data = await this._fetch();
        this.config.ManagerRoles = data.ManagerRoles.filter(e => e != (Id?.id != null ? Id.id : Id))
        return this;
    }

    addPingRole(Ids) {
        for (const id of Ids) this.config.PingRoles.push(id?.id != null ? id.id : id)
        return this;
    }

    addManagerRole(Ids) {
        for (const id of Ids) this.config.ManagerRoles.push(id?.id != null ? id.id : id)
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

    /**
     * Creates a ticket panel.
     * @param {TextChannel} Channel 
     * @param {MessageButton[]} Buttons 
     */
    async addTicketPanel(Channel, Buttons) {
        const data = await this._fetch();
        const Embeded = await helloMessageEmbed(data);

        const Message = await Channel.send({
            embeds: [Embeded],
            components: [
                {
                    type: 1,
                    components: Buttons
                }
            ]
        });

        this.config.TicketPanels.push({
            ID: uuid(),
            MessageID: Message.id,
            URL: Message.url,
            CustomIds: Buttons.map(e => e.customId),
            Deleted: false,
            Disabled: false
        });

        return {
            Message,
            this: this
        }
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
        function notNull(val, embed) {
            return val != null;
        }
        const fetched = await this._fetch();

        if (!fetched || (fetched == null)) {
            return (await this._create());
        }

        fetched.guildId = this.guildId;
        if (notNull(this.config.CategoryId)) fetched.categoryId = this.config.CategoryId;
        if (notNull(this.config.Embed.Description)) fetched.Embed.description = this.config.Embed.Description;
        if (notNull(this.config.Embed.Color)) fetched.Embed.color = this.config.Embed.Color;
        if (notNull(this.config.Embed.Title)) fetched.Embed.title = this.config.Embed.Title;
        if (fetched.PingRoles == null) fetched.PingRoles = [];
        if (fetched.ManagerRoles == null) fetched.ManagerRoles = [];
        if (!this.config.Remove.PingRoles) {
            this.config.PingRoles.forEach(e => {
                fetched.PingRoles.push(e);
            });
        } else {
            fetched.PingRoles = this.config.PingRoles;
        }
        if (!this.config.Remove.Managers) {
            this.config.ManagerRoles.forEach(e => {
                fetched.ManagerRoles.push(e);
            });
        } else {
            fetched.ManagerRoles = this.config.ManagerRoles;
        }
        if(fetched.TicketPanels == null) fetched.TicketPanels = [];
        if(this.config.TicketPanels.length >= 1){
            this.config.TicketPanels.forEach(e => {
                fetched.TicketPanels.push(e);
            });
        }

        return (await fetched.save().catch(console.log));
    }
}