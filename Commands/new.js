const { CommandInteraction, Client, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const jsh = require("discordjsh");
const { v4 } = require("uuid");
const { guildSettings, verifyPermissions } = require("../Modules/tickets");
const Embed = require("../Util/Embed");
const { Modal, showModal, TextInputComponent } = require('discord-modals');
const { Color } = require("../Config/config");
const { ColorMenu } = require("./server");
const ModalSubmitInteraction = require("discord-modals/src/structures/ModalSubmitInteraction");
const { pages: Pages, splitPages } = require("discord.js-util");
const { Reply, Stem } = require("../Config/config");

module.exports = {
    data: new jsh.commandBuilder()
        .setName(`panel`)
        .setDescription(`Manage your panels.`)
        .addSubcommand(s => {
            return s.setName(`create`)
                .setDescription(`Create a new ticket panel.`)
                .addChannelOption(o => o.setName("channel").setDescription(`The channel to send the panel in.`).setRequired(true));
        })
        .addSubcommand(s => {
            return s.setName(`list`)
                .setDescription(`List all your ticket panel(s).`)
        }),
    /**
     * Executes the / command.
     * @param {CommandInteraction} int 
     * @param {Client} client 
     */
    async execute(int, client) {
        const check = await verifyPermissions(int.member, ["MANAGER"], int);
        if (!check) return;

        const subcmd = int.options.getSubcommand();
        const subcmds = {
            "LIST": "list",
            "CREATE": "create"
        };
        const customIds = {
            "DEFAULTS": "PANEL_SET_DEFUALTS" + v4(),
            "CREATE": "PANEL_BUTTONS_CREATE" + v4(),
            "MODAL": "MODAL_EMBED_" + v4(),
            "MODEL_TEXT": {
                "TITLE": "MODAL_EMBED_TITLE",
                "DESCRIPTION": "MODAL_EMBED_DESCRIPTION",
                "COLOR": "MODAL_EMBED_COLOR"
            }
        }

        if (subcmd == subcmds.CREATE) {
            const modal = new Modal()
                .setCustomId(customIds.MODAL)
                .setTitle(`Ticket Panel Embed`)
                .addComponents(
                    new TextInputComponent()
                        .setCustomId(customIds.MODEL_TEXT.TITLE)
                        .setStyle(`SHORT`)
                        .setMinLength(1)
                        .setMaxLength(256)
                        .setPlaceholder(`🎟️ Tickets`)
                        //.setDefaultValue(`Tickets`)
                        .setRequired(true)
                        .setLabel(`Embed Title`),
                    new TextInputComponent()
                        .setCustomId(customIds.MODEL_TEXT.DESCRIPTION)
                        .setStyle(`LONG`)
                        .setMinLength(1)
                        .setMaxLength(4000)
                        .setPlaceholder(`Open a ticket if you would like to talk to mods!`)
                        //.setDefaultValue(`Open a ticket if you would like to talk to mods!`)
                        .setRequired(true)
                        .setLabel(`Embed Description`),
                    //Select menus on modals coming soon!
                    // new MessageSelectMenu(ColorMenu)
                    // .setCustomId(customIds.MODEL_TEXT.COLOR)
                );

            await showModal(modal, {
                client,
                interaction: int
            });

            let done = false;

            client.on("modalSubmit", async m => {
                if (done) return;
                if (m.customId != customIds.MODAL) return;
                console.log(`📜 Modal:`, m);
                done = true;

                const Embeded = new MessageEmbed()
                    .setTitle(m.getTextInputValue(customIds.MODEL_TEXT.TITLE))
                    .setDescription(m.getTextInputValue(customIds.MODEL_TEXT.DESCRIPTION))
                    .setColor(/*m.getTextInputValue(customIds.MODEL_TEXT.COLOR) ||*/ Color);

                await ModelDone([Embeded], m);
            });

            const ModelDone = async (embed, m) => {
                await m.reply({
                    embeds: new Embed()
                        .setTitle(`Button(s)`)
                        .setDescription(`Use \`/button\` to create add a button.`)
                        .build(),
                    components: [
                        {
                            type: 1,
                            components: [
                                new MessageButton()
                                    .setLabel(`Use defaults`)
                                    .setStyle("SECONDARY")
                                    .setCustomId(customIds.DEFAULTS),
                                new MessageButton()
                                    .setLabel(`Create`)
                                    .setStyle("SUCCESS")
                                    .setCustomId(customIds.CREATE)
                            ]
                        }
                    ]
                });
                const TicketButtons = [];
                let canceled = false;
                const GuildManager = new guildSettings()
                    .setGuildID(int.guild.id);

                const ButtonSelected = async (i) => {
                    const Channel = int.options.getChannel(`channel`);
                    const CleanedChannel = !Channel.isText() ? int.channel : Channel;
                    const Panel = await GuildManager.addTicketPanel(CleanedChannel, TicketButtons, embed);
                    await Panel.this.save();

                    await i.update({
                        embeds: new Embed()
                            .setTitle(`Ticket Panel Created`)
                            .setDescription(`A ticket panel has been created in ${CleanedChannel}!`)
                            .build(),
                        components: [
                            {
                                type: 1,
                                components: [
                                    new MessageButton()
                                        .setLabel(`View`)
                                        .setStyle("LINK")
                                        .setURL(Panel.Message.url)
                                ]
                            }
                        ]
                    });
                }
                client.on("interactionCreate", async i => {
                    if (canceled == true) return i.reply(`❌`);
                    if (i.isCommand() && (i.commandName == `button`)) {
                        const EmojiSelected = i.options.getString("emoji");
                        const LabelSelected = i.options.getString(`label`);
                        const LabelAndEmojiNull = EmojiSelected == null && LabelSelected == null;

                        TicketButtons.push(
                            new MessageButton()
                                .setLabel(LabelAndEmojiNull ? `Open Ticket` : LabelSelected)
                                .setStyle(i.options.getString(`style`) || "PRIMARY")
                                .setEmoji(EmojiSelected)
                                .setCustomId(v4())
                        );

                        i.reply({
                            ephemeral: true,
                            content: `✅`
                        });

                        if (TicketButtons.length >= 5) {
                            await ButtonSelected();
                        }
                    } else if (i.isButton() && (i.customId == customIds.DEFAULTS)) {
                        TicketButtons.push(
                            new MessageButton()
                                .setLabel(`Open Ticket`)
                                .setStyle(`PRIMARY`)
                                .setCustomId(v4())
                        );

                        await ButtonSelected(i);
                    } else if (i.isButton() && (i.customId == customIds.CREATE)) {
                        await ButtonSelected(i);
                    }
                });
            }
        } else if (subcmd == subcmds.LIST) {
            const GuildManager = new guildSettings()
                .setGuildID(int.guild.id);
            const Panels = await GuildManager.fetchAllTicketPanels();

            const Pages2 = await splitPages(Panels, async (panel) => {
                const RawChannel = panel.URL.slice(48, panel.URL.length - 19);
                const Channel = int.guild.channels.cache.get(RawChannel);

                return `**${Stem} Channel:** ${Channel || "Unknown Channel"}\n**${Reply} Message Link:** [click here](${panel.URL})\n\n`
            });

            await new Pages()
                .setInteraction(int)
                .setFilter(i => i.user.id == int.user.id)
                .setPages(Pages2.toEmbeds().map(e => e.setColor(Color)))
                .setEmojis(`<:leave:863464329633726464>`, `<:join:863464329613672508>`)
                .send();
        }
    }
}
