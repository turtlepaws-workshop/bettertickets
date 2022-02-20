const { CommandInteraction, Client, MessageButton, MessageEmbed, MessageSelectMenu } = require("discord.js");
const jsh = require("discordjsh");
const { v4 } = require("uuid");
const { guildSettings } = require("../Modules/tickets");
const Embed = require("../Util/Embed");
const { Modal, showModal, TextInputComponent } = require('discord-modals');
const { Color } = require("../Config/config");
const { ColorMenu } = require("./server");

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
    async execute(int, client){
        const subcmd = int.options.getSubcommand();
        const subcmds = {
            "LIST": "list",
            "CREATE": "create"
        };
        const customIds = {
            "DEFAULTS": "PANEL_SET_DEFUALTS",
            "CREATE": "PANEL_BUTTONS_CREATE",
            "MODAL": "MODAL_EMBED",
            "MODEL_TEXT": {
                "TITLE": "MODAL_EMBED_TITLE",
                "DESCRIPTION": "MODAL_EMBED_DESCRIPTION",
                "COLOR": "MODAL_EMBED_COLOR"
            }
        }

        if(subcmd == subcmds.CREATE){
            await int.reply({
                embeds: new Embed()
                .setTitle(`Embed`)
                .setDescription(`Use \`/embed\` to create an embed.`)
                .build()
            });

            const ModelDone = async (embed) => {
                await int.editReply({
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
    
                const ButtonSelected = async () => {
                    const Channel = int.options.getChannel(`channel`);
                    const CleanedChannel = !Channel.isText() ? int.channel : Channel;
                    const Panel = await GuildManager.addTicketPanel(CleanedChannel, TicketButtons, embed);
                    await Panel.this.save();
    
                    await int.editReply({
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
                    if(canceled == true) return i.reply(`❌`);
                    if(i.isCommand() && (i.commandName == `button`)){
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
                        
                        if(TicketButtons.length >= 5){
                            await ButtonSelected();
                        }
                    } else if(i.isButton() && (i.customId == customIds.DEFAULTS)){
                        TicketButtons.push(
                            new MessageButton()
                            .setLabel(`Open Ticket`)
                            .setStyle(`PRIMARY`)
                            .setCustomId(v4())
                        );
    
                        await ButtonSelected();
                    }else if(i.isButton() && (i.customId == customIds.CREATE)){
                        await ButtonSelected();
                    }
                });
            }
            client.on("interactionCreate", async ii => {
                if(!ii.isCommand() || ii.commandName != "embed") return;

                const modal = new Modal()
                .setCustomId(customIds.MODAL)
                .setTitle(`Ticket Panel Embed`)
                .addComponents(
                    new TextInputComponent()
                    .setCustomId(customIds.MODEL_TEXT.TITLE)
                    .setStyle(`SHORT`)
                    .setMinLength(1)
                    .setMaxLength(256)
                    .setPlaceholder(`Enter Text`)
                    .setValue(`Tickets`)
                    .setRequired(true)
                    .setLabel(`Embed Title`),
                    new TextInputComponent()
                    .setCustomId(customIds.MODEL_TEXT.DESCRIPTION)
                    .setStyle(`LONG`)
                    .setMinLength(1)
                    .setMaxLength(4000)
                    .setPlaceholder(`Enter Text`)
                    .setValue(`Open a ticket if you need help!`)
                    .setRequired(true)
                    .setLabel(`Embed Description`),
                    // new MessageSelectMenu(ColorMenu)
                    // .setCustomId(customIds.MODEL_TEXT.COLOR)
                );

                await showModal(modal, {
                    client,
                    interaction: ii
                });

                client.on("modalSubmit", async m => {
                    const Embeded = new MessageEmbed()
                    .setTitle(m.getTextInputValue(customIds.MODEL_TEXT.TITLE))
                    .setDescription(m.getTextInputValue(customIds.MODEL_TEXT.DESCRIPTION))
                    .setColor(/*m.getTextInputValue(customIds.MODEL_TEXT.COLOR) ||*/ Color);

                    await m.deferReply({
                        ephemeral: true
                    });

                    await m.editReply({
                        ephemeral: true,
                        content: `✅`
                    });

                    await ModelDone([Embeded]);
                });
            });

        } else if(subcmd == subcmds.LIST){
            
        }
    }
}