const { CommandInteraction, Client, MessageButton } = require("discord.js");
const Discord = require("discord.js");
const jsh = require("discordjsh");
const { Reply, Stem } = require("../Config/config");
const { Model } = require("../Models/Guild");
const { guildSettings } = require("../Modules/tickets");
const Embed = require("../Util/Embed");

module.exports = {
    data: new jsh.commandBuilder()
    .setName(`server`)
    .setDescription(`Change the servers settings.`),
    /**
     * Executes the / command.
     * @param {CommandInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client){
        const CustomIds = {
            "CANCEL": "SERVER_CANCEL",
            "CATEGORY": "SERVER_SET_CATEGORY",
            "EMBED_COLOR": "SERVER_SET_EMBED_COLOR",
            "EMBED_TITLE": "SERVER_SET_EMBED_TITLE",
            "EMBED_DESCRIPTION": "SERVER_SET_EMBED_DESCRIPTION",
            "PING_ROLES": "SERVER_SET_PING_ROLES",
            "MANAGER_ROLES": "SERVER_SET_MANAGER_ROLES"
        };
        /**
         * @type {Discord.MessageButtonStyle}
         */
        const DefaultStyle = "SECONDARY";
        /**
         * @type {Discord.MessageButtonStyle}
         */
        const DefaultSelected = "DANGER";
        const Buttons = {
            Cancel: new MessageButton()
            .setCustomId(CustomIds.CANCEL)
            .setLabel(`Cancel`)
            .setStyle(DefaultSelected),
            Category: new MessageButton()
            .setCustomId(CustomIds.CATEGORY)
            .setLabel(`Set Category`)
            .setStyle(DefaultStyle),
            PingRoles: new MessageButton()
            .setCustomId(CustomIds.PING_ROLES)
            .setLabel(`Set Ping Roles`)
            .setStyle(DefaultStyle),
            ManagerRoles: new MessageButton()
            .setCustomId(CustomIds.MANAGER_ROLES)
            .setLabel(`Set Manager Roles`)
            .setStyle(DefaultStyle),
            EmbedTitle: new MessageButton()
            .setCustomId(CustomIds.EMBED_TITLE)
            .setLabel(`Set Embed Title`)
            .setStyle(DefaultStyle),
            EmbedDescription: new MessageButton()
            .setCustomId(CustomIds.EMBED_DESCRIPTION)
            .setLabel(`Set Embed Description`)
            .setStyle(DefaultStyle),
            EmbedColor: new MessageButton()
            .setCustomId(CustomIds.EMBED_COLOR)
            .setLabel(`Set Embed Color`)
            .setStyle(DefaultStyle)
        };
        const Rows = [
            new Discord.MessageActionRow()
            .setComponents(
                Buttons.Category,
                Buttons.PingRoles,
                Buttons.ManagerRoles,
                Buttons.EmbedTitle,
                Buttons.EmbedDescription,
            ),
            new Discord.MessageActionRow()
            .setComponents(
                Buttons.EmbedColor,
                Buttons.Cancel
            ),
        ];
        const RowsSelected = [
            new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.Category).setDisabled(true),
                new MessageButton(Buttons.PingRoles).setDisabled(true),
                new MessageButton(Buttons.ManagerRoles).setDisabled(true),
                new MessageButton(Buttons.EmbedTitle).setDisabled(true),
                new MessageButton(Buttons.EmbedDescription).setDisabled(true),
            ),
            new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.EmbedColor).setDisabled(true),
                new MessageButton(Buttons.Cancel).setStyle(DefaultSelected)
            )
        ];
        const RowsCanceled= [
            new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.Category).setDisabled(true),
                new MessageButton(Buttons.PingRoles).setDisabled(true),
                new MessageButton(Buttons.ManagerRoles).setDisabled(true),
                new MessageButton(Buttons.EmbedTitle).setDisabled(true),
                new MessageButton(Buttons.EmbedDescription).setDisabled(true),
            ),
            new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.EmbedColor).setDisabled(true),
                new MessageButton(Buttons.Cancel).setDisabled(true)
            )
        ];

        const generateData = async () => {
            return (await Model.findOne({
                guildId: int.guild.id
            }));
        }

        const generateEmbed = async (Cancel) => {
            if(Cancel) {
                return new Embed()
                .setTitle(`Server Config Closed`)
                .setDescription(`You have finished configuring your server!`)
                .build();
            }
            const data = await generateData();
            const NoData = i => `${i} not set!`;
            const Is = {
                "CATEGORY": "Category",
                "PINGS": "Ping Roles",
                "MANAGER": "Manager Roles",
                "EMBED_COLOR": "Embed Color",
                "EMBED_TITLE": "Embed Title",
                "EMBED_DES": "Embed Description"
            }

            //ManagerRoles
            //PingRoles
            return new Embed()
            .setTitle(`Server Config`)
            .setDescription(`${Stem} **Category:** ${data?.categoryId != null ? `<#${data.categoryId}>` : `${NoData(Is.CATEGORY)}`}\n${Stem} **Embed Title:** ${data?.Embed?.title || `${NoData(Is.CATEGORY)}`}\n${Stem} **Embed Description:** ${data?.Embed?.description || `${NoData(Is.EMBED_DES)}`}\n${Stem} **Embed Color:** ${data?.Embed?.color != null ? `\`${data.Embed.color}\``: `${NoData(Is.EMBED_COLOR)}`}\n${Stem} **Ping Roles:** ${data?.PingRoles?.length >= 1 ? data.PingRoles.map(e => `<@&${e}>`).join(" ") : `${NoData(Is.PINGS)}`}\n${Reply} **Manager Roles:** ${data?.ManagerRoles?.length >= 1 ? data.ManagerRoles.map(e => `<@&${e}>`).join(" ") : `${NoData(Is.MANAGER)}`}`)
            .build();
        }

        /**
         * @type {Discord.Message}
         */
        const Message = await int.reply({
            embeds: await generateEmbed(),
            components: Rows,
            fetchReply: true
        });

        const collector = Message.createMessageComponentCollector({
            filter: i=>i.user.id == int.user.id
        });

        const GuildManager = new guildSettings()
        .setGuildID(int.guild.id);

        collector.on("collect", async i => {
            if(!i.isButton()) return;

            if(i.customId == CustomIds.CANCEL){
                await i.update({
                    components: RowsCanceled,
                    embeds: await generateEmbed(true)
                });
                collector.stop();
                return;
            } else if(i.customId == CustomIds.CATEGORY){
                await i.update({
                    components: RowsSelected
                });

                const categoryRaw1 = await int.channel.awaitMessages({
                    max: 1,
                    filter: i=>i.author.id == int.user.id
                });
                const categoryRaw = categoryRaw1.first().content;

                const Category = int.guild.channels.cache.find(e => e.id == categoryRaw || e.name.toLowerCase() == categoryRaw.replace("#", "").toLowerCase()) || await int.guild.channels.create(`Tickets`, {
                    type: `GUILD_CATEGORY`
                });

                await GuildManager.setCategoryId(Category.id)
                .save();
                
                await int.editReply({
                    components: Rows,
                    embeds: await generateEmbed()
                });
            }
        });
    }
}