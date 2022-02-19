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
    async execute(int, client) {
        const CustomIds = {
            "CANCEL": "SERVER_CANCEL",
            "CATEGORY": "SERVER_SET_CATEGORY",
            "EMBED_COLOR": "SERVER_SET_EMBED_COLOR",
            "EMBED_TITLE": "SERVER_SET_EMBED_TITLE",
            "EMBED_DESCRIPTION": "SERVER_SET_EMBED_DESCRIPTION",
            "PING_ROLES": "SERVER_SET_PING_ROLES",
            "MANAGER_ROLES": "SERVER_SET_MANAGER_ROLES",
            "COLOR_MENU": "SERVER_COLOR_MENU"
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
        
        const Selected1 = new Discord.MessageActionRow()
        .setComponents(
            new MessageButton(Buttons.Category).setDisabled(true),
            new MessageButton(Buttons.PingRoles).setDisabled(true),
            new MessageButton(Buttons.ManagerRoles).setDisabled(true),
            new MessageButton(Buttons.EmbedTitle).setDisabled(true),
            new MessageButton(Buttons.EmbedDescription).setDisabled(true),
        );

        const Selected2 = new Discord.MessageActionRow()
        .setComponents(
            new MessageButton(Buttons.EmbedColor).setDisabled(true),
            new MessageButton(Buttons.Cancel).setStyle(DefaultSelected)
        );

        const RowsSelected = [
            Selected1,
            Selected2
        ];

        const RowCancel1 = new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.Category).setDisabled(true),
                new MessageButton(Buttons.PingRoles).setDisabled(true),
                new MessageButton(Buttons.ManagerRoles).setDisabled(true),
                new MessageButton(Buttons.EmbedTitle).setDisabled(true),
                new MessageButton(Buttons.EmbedDescription).setDisabled(true),
            )

        const RowCancel2 = new Discord.MessageActionRow()
            .setComponents(
                new MessageButton(Buttons.EmbedColor).setDisabled(true),
                new MessageButton(Buttons.Cancel).setDisabled(true)
            )

        const RowsCanceled = [
            RowCancel1,
            RowCancel2
        ];
        const ColorMenu = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageSelectMenu()
                    .setCustomId(CustomIds.COLOR_MENU)
                    .setPlaceholder(`Select a color`)
                    .addOptions(
                        {
                            label: 'Black',
                            value: 'DEFAULT',
                        },
                        {
                            label: 'White',
                            value: 'WHITE',
                        },
                        {
                            label: 'Aqua',
                            value: 'AQUA',
                        },
                        {
                            label: 'Green',
                            value: 'GREEN'
                        },
                        {
                            label: 'Blue',
                            value: 'BLUE',
                        },
                        {
                            label: 'Yellow',
                            value: 'YELLOW'
                        },
                        {
                            label: 'Purple',
                            value: 'PURPLE'
                        },
                        {
                            label: 'Vivid Pink',
                            value: 'LUMINOUS_VIVID_PINK'
                        },
                        {
                            label: 'Fuchsia',
                            value: 'FUCHSIA'
                        },
                        {
                            label: 'Gold',
                            value: 'GOLD'
                        },
                        {
                            label: 'Orange',
                            value: 'ORANGE'
                        },
                        {
                            label: 'Red',
                            value: 'RED'
                        },
                        {
                            label: 'Grey',
                            value: 'GREY'
                        },
                        {
                            label: 'Darker Grey',
                            value: 'DARKER_GREY'
                        },
                        {
                            label: 'Navy',
                            value: 'NAVY'
                        },
                        {
                            label: "Blurple",
                            value: "BLURPLE"
                        }
                    )
            )

        const generateData = async () => {
            return (await Model.findOne({
                guildId: int.guild.id
            }));
        }

        const generateEmbed = async (Cancel=false, notice=null) => {
            if (Cancel) {
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
                .setDescription(`${Stem} **Category:** ${data?.categoryId != null ? `<#${data.categoryId}>` : `${NoData(Is.CATEGORY)}`}\n${Stem} **Embed Title:** ${data?.Embed?.title || `${NoData(Is.CATEGORY)}`}\n${Stem} **Embed Description:** ${data?.Embed?.description || `${NoData(Is.EMBED_DES)}`}\n${Stem} **Embed Color:** ${data?.Embed?.color != null ? `\`${data.Embed.color}\`` : `${NoData(Is.EMBED_COLOR)}`}\n${Stem} **Ping Roles:** ${data?.PingRoles?.length >= 1 ? data.PingRoles.map(e => `<@&${e}>`).join(" ") : `${NoData(Is.PINGS)}`}\n${Reply} **Manager Roles:** ${data?.ManagerRoles?.length >= 1 ? data.ManagerRoles.map(e => `<@&${e}>`).join(" ") : `${NoData(Is.MANAGER)}`}`)
                .setFooter(notice)
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
            filter: i => i.user.id == int.user.id
        });

        const GuildManager = new guildSettings()
            .setGuildID(int.guild.id);

        collector.on("collect", async i => {
            if (!i.isButton()) return;

            if (i.customId == CustomIds.CANCEL) {
                await i.update({
                    components: RowsCanceled,
                    embeds: await generateEmbed(true)
                });
                collector.stop();
                return;
            } else if (i.customId == CustomIds.CATEGORY) {
                await i.update({
                    components: RowsSelected
                });

                const categoryRaw1 = await int.channel.awaitMessages({
                    max: 1,
                    filter: i => i.author.id == int.user.id
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
            } else if (i.customId == CustomIds.MANAGER_ROLES) {
                await i.update({
                    components: RowsSelected,
                    embeds: await generateEmbed(false, `Say "r_{number}" to remove one.`)
                });

                const raw1 = await int.channel.awaitMessages({
                    max: 1,
                    filter: i => i.author.id == int.user.id
                });
                const raw = raw1.first();

                if(raw.content.startsWith(`r_`)){
                    const data = await GuildManager._fetch();
                    const Role = data.ManagerRoles[Number(raw.content.slice(raw.content.indexOf("_")+1, raw.content.length))-1]

                    await (await GuildManager.removeManagerRole(Role)).save();

                    await int.editReply({
                        components: Rows,
                        embeds: await generateEmbed()
                    });
                } else {
                    const Roles = raw.mentions.roles.size >= 1 ? Array.from(raw.mentions.roles.values()) : [];
                    function startsOrEndsWith(val, match) {
                        return (match.startsWith(val) || match.endsWith(val));
                    }
    
                    if (Roles.length <= 0) {
                        for (const role of int.guild.roles.cache.values()) {
                            if (startsOrEndsWith(role.name, raw.content) || startsOrEndsWith(role.id, raw.content)) {
                                Roles.push(role);
                            }
                        }
                    }
    
                    await GuildManager.addManagerRole(Roles)
                        .save();
    
                    await int.editReply({
                        components: Rows,
                        embeds: await generateEmbed()
                    });
                }
            } else if (i.customId == CustomIds.PING_ROLES) {
                await i.update({
                    components: RowsSelected,
                    embeds: await generateEmbed(false, `Say "r_{number}" to remove one.`)
                });

                const raw1 = await int.channel.awaitMessages({
                    max: 1,
                    filter: i => i.author.id == int.user.id
                });
                const raw = raw1.first();

                if(raw.content.startsWith(`r_`)){
                    const data = await GuildManager._fetch();
                    const Role = data.PingRoles[Number(raw.content.slice(raw.content.indexOf("_")+1, raw.content.length))-1]

                    await (await GuildManager.removePingRole(Role)).save();

                    await int.editReply({
                        components: Rows,
                        embeds: await generateEmbed()
                    });
                } else {
                    const Roles = raw.mentions.roles.size >= 1 ? Array.from(raw.mentions.roles.values()) : [];
                    function startsOrEndsWith(val, match) {
                        return (match.startsWith(val) || match.endsWith(val));
                    }
    
                    if (Roles.length <= 0) {
                        for (const role of int.guild.roles.cache.values()) {
                            if (startsOrEndsWith(role.name, raw.content) || startsOrEndsWith(role.id, raw.content)) {
                                Roles.push(role);
                            }
                        }
                    }
    
                    await GuildManager.addPingRole(Roles)
                        .save();
    
                    await int.editReply({
                        components: Rows,
                        embeds: await generateEmbed()
                    });
                }
            } else if (i.customId == CustomIds.EMBED_TITLE) {
                await i.update({
                    components: RowsSelected
                });

                const msgs = await int.channel.awaitMessages({
                    max: 1,
                    filter: i => i.author.id == int.user.id
                });
                const rawText = msgs.first();

                await GuildManager.setEmbedTitle(rawText)
                    .save();

                await int.editReply({
                    components: Rows,
                    embeds: await generateEmbed()
                });
            } else if (i.customId == CustomIds.EMBED_DESCRIPTION) {
                await i.update({
                    components: RowsSelected
                });

                const msgs = await int.channel.awaitMessages({
                    max: 1,
                    filter: i => i.author.id == int.user.id
                });
                const rawText = msgs.first();

                await GuildManager.setEmbedDescription(rawText)
                    .save();

                await int.editReply({
                    components: Rows,
                    embeds: await generateEmbed()
                });
            } else if (i.customId == CustomIds.EMBED_COLOR) {
                const components = [
                    Selected1,
                    Selected2,
                    ColorMenu
                ]
                await i.update({
                    components
                });

                const interaction = await Message.awaitMessageComponent({
                    filter: i => i.user.id == int.user.id,
                    componentType: "SELECT_MENU"
                });

                if (interaction.customId == CustomIds.COLOR_MENU) {
                    await GuildManager.setEmbedColor(interaction.values[0])
                        .save();

                    await int.editReply({
                        components: Rows,
                        embeds: await generateEmbed()
                    });
                }
            }
        });
    }
}