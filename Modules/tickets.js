const { GuildMember, PermissionOverwrites, MessageEmbed, TextChannel, MessageButton, ButtonInteraction, Role } = require("discord.js");
const djs = require("discord.js");
const { Model } = require("../Models/Ticket");
const { Model: GuildModel } = require("../Models/Guild");
const { v4: uuid } = require("uuid");
const { Color } = require("../Config/config");
const Embed = require("../Util/Embed");
const { timestamp } = require("discord.js-util");

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

    if (int) {
        int.reply({
            ephemeral: true,
            content: `Created a ticket in ${Channel}`
        });
    }

    const PingRoless = await GuildSettings.getPingRoles();
    const ButtonClicked = int.message.components[0].components.find(e => e.customId == int.customId);

    const Message = await Channel.send({
        content: PingRoless.map(e => `<@&${e}>`).join(" "),
        embeds: [
            (await this.generateHelloMessage(GuildSettings))
            .addField(`Reason`, `\`${ButtonClicked.label}\``)
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

    const LogManager = new this.Log(Ticket)
    .setGuildID(i.guild.id);
    await LogManager.autoSetData(i.member);
    return await LogManager.LogIt();
};

const helloMessageEmbed = module.exports.generateHelloMessage = async (Guild) => {
    if (Guild?._fetch != null) Guild = await Guild._fetch();
    return new MessageEmbed()
        .setColor(Guild?.Embed?.color || Color)
        .setTitle(Guild?.Embed?.title || `Hey there!`)
        .setDescription(Guild?.Embed?.description || `Thank you for contacting support today, how can we help?`);
}
/**
 * Checks if the user has Discord permissions or manager permissions.
 * @param {GuildMember} member 
 * @param {Array<djs.PermissionString|"MANAGER">} requiredPermission
 * @param {djs.Interaction}
 * @returns {Promise<Boolean>}
 */
module.exports.verifyPermissions = async (member, requiredPermission, replyTo) => {
    const GuildManager = new this.guildSettings()
        .setGuildID(member.guild.id);

    const {
        guild,
        client
    } = member;

    const managers = await GuildManager.getManagerRoles();
    /**@type {Role[]} */
    const ManagerRoles = [];
    if(managers != null){
        for (const Role of guild.roles.cache.values()) {
            if (managers?.includes(Role.id)) ManagerRoles.push(Role);
        }
        for (const Role of ManagerRoles) {
            if (Role.members.has(member.user.id) && requiredPermission == "MANAGER") return true;
        }
    }
    if (member.permissions.has(requiredPermission)) return true;
    else {
        replyTo.reply({
            embeds: new Embed()
                .setTitle(`Invalid Permissions!`)
                .setDescription(`You are required to have the \`${requiredPermission}\` permission to execute this command!`)
                .build(),
            ephemeral: true
        }).catch(() => { });

        return false;
    }
}

const thiss = this;

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
            Add: {
                PingRoles: false,
                Managers: false
            },
            TicketPanels: [],
            LogChannel: null
        };
    }

    async initFetchRoles(){
        const GuildThing = await this._fetch();

        if(GuildThing.PingRoles?.length >= 1 && GuildThing.PingRoles != null) this.config.PingRoles = GuildThing.PingRoles;
        if(GuildThing.ManagerRoles?.length >= 1 && GuildThing.ManagerRoles != null) this.config.ManagerRoles = GuildThing.ManagerRoles;
    }

    /**
     * @returns {Promise<String[]>}
     */
    async getManagerRoles() {
        const d = await this._fetch();
        return d?.ManagerRoles;
    }

    /**
     * @returns {Promise<String[]>}
     */
    async getPingRoles() {
        const d = await this._fetch();
        return d?.PingRoles;
    }

    /**
     * @param {djs.Guild} guild
     * @returns {Promise<TextChannel>}
     */
    async getLogChannel(guild=null) {
        const d = await this._fetch();
        return (guild == null ? d?.LogChannel : guild.channels.cache.get(d?.LogChannel));
    }

    setGuildID(Id) {
        this.guildId = Id
        this.initFetchRoles();
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
        this.config.Add.PingRoles = true
        for (const id of Ids) {
            const Id = id?.id != null ? id.id : id;
            if(this.config.PingRoles.includes(Id)) continue;
            this.config.PingRoles.push(Id);
        }
        return this;
    }

    addManagerRole(Ids) {
        this.config.Add.Managers = true
        for (const id of Ids) {
            const Id = id?.id != null ? id.id : id;
            if(this.config.ManagerRoles.includes(Id)) continue;
            this.config.ManagerRoles.push(id?.id != null ? id.id : id)
        }
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

    setLogChannel(channelId) {
        this.config.LogChannel = channelId?.id != null ? channelId.id : channelId
        return this;
    }

    /**
     * Fetch's all the guilds ticket panels.
     */
    async fetchAllTicketPanels(){
        const all = await this._fetch();

        return all.TicketPanels;
    }

    /**
     * Creates a ticket panel.
     * @param {TextChannel} Channel 
     * @param {MessageButton[]} Buttons 
     */
    async addTicketPanel(Channel, Buttons, embed) {
        const data = await this._fetch();
        const Embeded = await helloMessageEmbed(data);

        const Message = await Channel.send({
            embeds: embed,
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

    debugReset(){
        this.config.Remove.Managers = false;
        this.config.Remove.PingRoles = false;
        this.config.Add.Managers = false;
        this.config.Add.PingRoles = false;
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
        if (notNull(this.config.LogChannel)) fetched.LogChannel = this.config.LogChannel;
        if (fetched.PingRoles == null) fetched.PingRoles = [];
        if (fetched.ManagerRoles == null) fetched.ManagerRoles = [];
        if (!this.config.Remove.PingRoles && this.config.Add.PingRoles) {
            this.config.PingRoles.forEach(e => {
                fetched.PingRoles.push(e);
            });
        } else if(this.config.Remove.PingRoles) {
            fetched.PingRoles = this.config.PingRoles;
        }
        if (!this.config.Remove.Managers && this.config.Add.Managers) {
            this.config.ManagerRoles.forEach(e => {
                fetched.ManagerRoles.push(e);
            });
        } else if(this.config.Remove.Managers) {
            fetched.ManagerRoles = this.config.ManagerRoles;
        }
        if (fetched.TicketPanels == null) fetched.TicketPanels = [];
        if (this.config.TicketPanels.length >= 1) {
            this.config.TicketPanels.forEach(e => {
                fetched.TicketPanels.push(e);
            });
        }

        this.debugReset();

        return (await fetched.save().catch(console.log));
    }
}

module.exports.Log = class TicketLog {
    constructor(modelTicket){
        this.guildId = null;
        this.GuildSettings = null;
        this.Member = null;
        this.TicketModel = modelTicket;

        this.config = {
            TicketId: null,
            OpenedBy: null,
            ClosedBy: null,
            Reason: `No reason specified.`,
            OpenTime: new timestamp(),
            CloseTime: new timestamp()
        };
    }

    setGuildID(Id){
        this.guildId = Id
        return this;
    }

    setTicketId(Id){
        this.config.TicketId = Id
        return this;
    }

    setOpenTime(time){
        this.config.OpenTime.setTime(time)
        return this;
    }

    setReason(text){
        this.config.Reason = text
        return this;
    }

    setClosedBy(user){
        this.config.ClosedBy = user
        return this;
    }

    setOpenedBy(user){
        this.config.OpenedBy = user
        return this;
    }

    setClosedTime(time){
        this.config.CloseTime.setTime(time)
        return this;
    }

    /**
     * @param {GuildMember} memberClosed 
     */
    async autoSetData(memberClosed){
        this.Member = memberClosed;
        const GuildManager = this.GuildSettings = new thiss.guildSettings()
        .setGuildID(memberClosed.guild.id);
        const data = await GuildManager._fetch();
        const AllTickets = await Model.find({
            guildId: memberClosed.guild.id
        });
        const Ticket = this.TicketModel;
        
        return this.setClosedBy(memberClosed)
        .setClosedTime(Date.now())
        .setOpenTime(Ticket.dateCreated)
        .setOpenedBy(`<@${Ticket.userId}>`)
        .setTicketId(AllTickets.length-1)
        .setGuildID(memberClosed.guild.id);
    }

    async LogIt(){
        const {
            config
        } = this;
        function toId(val){
            val = val.toString();

            return val.replace(`<`, "")
            .replace("@", "")
            .replace(">", "");
        }

        const client = require("../index").getClient();

        const usr = await client.users.fetch(toId(config.OpenedBy));
        const usr2 = await client.users.fetch(toId(config.ClosedBy));

        const embeded = new Embed()
        .setTitle(`Ticket Closed`)
        .addField(`Ticket ID`, `${config.TicketId}`, true)
        .addField(`Opened By`, `${config.OpenedBy}`, true)
        .addField(`Closed By`, `${config.ClosedBy}`, true)
        .addField(`Reason`, `${config.Reason}`, true)
        .addField(`Close Time`, `${config.CloseTime}`, true)
        .addField(`Open Time`, `${config.OpenTime}`, true)
        .setAuthor({
            name: `By ${usr.username}`,
            iconURL: usr.displayAvatarURL()
        })
        .setFooter({
            text: `Close: ${usr2.id} • Open: ${usr.id}`
        });

        const Channel = await this.GuildSettings.getLogChannel(this.Member.guild);

        if(!Channel) return;

        const Message = await Channel.send({
            embeds: embeded.build()
        });

        return {
            Message,
            Channel,
            embeded
        }
    }
}