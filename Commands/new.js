const { CommandInteraction, Client, MessageButton } = require("discord.js");
const jsh = require("discordjsh");
const { v4 } = require("uuid");
const { guildSettings } = require("../Modules/tickets");
const Embed = require("../Util/Embed");

module.exports = {
    devOnly: true,
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
            "CREATE": "PANEL_BUTTONS_CREATE"
        }

        if(subcmd == subcmds.CREATE){
            await int.reply({
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
                const Panel = await GuildManager.addTicketPanel(CleanedChannel, TicketButtons);
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

        } else if(subcmd == subcmds.LIST){
            
        }
    }
}