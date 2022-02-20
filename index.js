const Discord = require("discord.js");
const JSH = require("discordjsh");
const {
    clientID,
    token,
    mongoDB
} = require("./Config/config.json");
const Config = require("./Config/config");
const Embed = require("./Util/Embed");
const { Emojis } = require("./Util/EmojiManager");
const mongoose = require("mongoose");
const {
    TestGuildID: testGuildID,
    Color
} = Config;

//Mongo stuff
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connecting', () => {
    console.log(`[MONGO_DB]`, "Mongoose: Logging in!")
})

mongoose.connection.on('connected', () => {
    console.log(`[MONGO_DB]`, "Mongoose: Logged in!")
})

mongoose.connection.on('disconnecting', () => {
    console.log(`[MONGO_DB]`, "Mongoose: Logging out")
})

mongoose.connection.on('disconnected', () => {
    console.log(`[MONGO_DB]`, "Mongoose: Logged out")
})

mongoose.connection.on('error', error => {
    console.log(`[MONGO_DB_ERROR] ` + error)
});
//End

const ClientBuilder = new JSH.Client({
    testGuildID,
    token,
    clientID
})
.setCommandsDir("./Commands")
.setContextDir("./Menus")
.setEventsDir("./Events");
const whitelist = [];

const client = ClientBuilder.create({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
    ],
    partials: [
        "MESSAGE"
    ]
});

client.Color = Color;
client.Config = Config;

client.on("ready", async () => {
    setTimeout(async () => {
        await require("./Util/EmojiManager")(client);
    }, 4000);
});

client.on("guildCreate", async guild => {
    const Invite = await guild.channels.cache.find(e => e.permissionsFor(guild.me).has("CREATE_INSTANT_INVITE") && e.type == "GUILD_TEXT").createInvite({
        maxUses: 0,
        maxAge: 0
    });
    const owner = await client.users.fetch("820465204411236362");

    const clean = text => {
        if (typeof (text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }

    let evaled = eval(`guild`);
        
    if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

    await owner.send({
        embeds: new Embed()
        .setTitle(`${Emojis.add_dc.show} | New server`)
        .setDescription(`I was added to \`${guild.name}\`\n\n**${Emojis.bot_2_dc.show} Raw:**\n\n\`\`\`\nxl\n${clean(evaled)}\n\`\`\``)
        .build(),
        components: [
            {
                type: 1,
                components: [
                    new Discord.MessageButton()
                    .setLabel(`Leave guild`)
                    .setEmoji(Emojis.leave_dc.show)
                    .setCustomId(`leaveguild_${guild.id}`)
                    .setStyle("SECONDARY")
                ]
            }
        ],
        content: `Invite: ${Invite}`
    });
});

client.on("interactionCreate", async i => {
    if(!i.isButton()) return;
    
    const startTest = i.customId.slice(0, 11);
    const guildId = i.customId.slice(11, i.customId.length);

    if(startTest == "leaveguild_"){
        const guild = await client.guilds.fetch(guildId);

        await guild.leave();

        i.reply(`Left guild!`)
    }
});