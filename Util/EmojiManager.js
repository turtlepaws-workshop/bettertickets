const { Client } = require("discord.js");
const fs = require("fs");
const Guilds = {
    Discons: [
        "930524332638208020",
        "930250893457240094",
        "929884970263134258"
    ],
    discordApp: "887143380990185512",
    Misc: "917201080268488796",
    Main: "863457284456972298"
};
const All = [
    "930524332638208020",
    "930250893457240094",
    "929884970263134258",
    "887143380990185512",
    "917201080268488796",
    "863457284456972298"
];

/**
 * @param {Client} client 
 */
module.exports = async (client) => {
    let file = {};
    client.emojis.cache.forEach(e => {
        if (All.includes(e.guild.id)){
            const from = Guilds.Discons.includes(e.guild.id) ? "discons" : e.guild.id == Guilds.discordApp ? "discordapp" : "misc";
            const fromShort = Guilds.Discons.includes(e.guild.id) ? "dc" : e.guild.id == Guilds.discordApp ? "da" : e.guild.id == Guilds.Main ? "1" : "m";

            file[(e.name + "_" + fromShort)] = {
                name: e.name,
                url: e.url,
                id: e.id,
                show: e.toString()
            };
        }
    });

    fs.writeFileSync(`./emojis.json`, JSON.stringify(file));
};

module.exports.Emojis = require("../emojis.json");