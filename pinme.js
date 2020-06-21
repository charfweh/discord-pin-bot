const discord = require("discord.js");
const bot = new discord.Client({disableEveryone : true});
// const owner= process.env.owner
const cmdfile = require('./botconfig.json')
const stubowner = cmdfile.owner
const prefix = cmdfile.prefix
const fs = require('fs')
const talked = new Set();


//dotenv vars
const env = require('dotenv').config()
// const prefix = process.env.prefix
bot.on("ready", async ()=> {
    console.log('I am ready to pin');
    bot.users.cache.get(stubowner).send(`Im up${bot.uptime} with cmds ${cmdfile.cmdname.length}`)
    bot.user.setActivity("Extracting pins | ~help to view more", {type : "PLAYING"});
    bot.user.setStatus("online");
    bot.guilds.cache.forEach(g=>{
        bot.users.cache.get(stubowner).send(`Guild name ${g.name}`);
    })
});
bot.on('guildCreate', async(guild)=>{
  bot.channels.cache.get(cmdfile.guildchannel).send(`Joined a guild ${guild.name}`)
})
bot.on('guildDelete',async(g)=>{
  bot.channels.cache.get(cmdfile.guildchannel).send(`Left a guild ${g.name}`)
})

bot.on("message", async message=> {

    function reportdev(err,message){
        const reportembed = new discord.MessageEmbed()
        .setTitle("Error encountered")
        .addField("Server name",message.guild.name)
        .addField("Server id",message.guild.id)
        .addField("Error",err)
        .setColor('RANDOM');
        bot.users.cache.get(stubowner).send(reportembed);
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd  = args.shift().toLowerCase();
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    if(message.channel.type == 'dm') return
    if(message.content.startsWith(prefix) && cmdfile.cmdname.includes(cmd)){
      if(talked.has(message.author.id)){
            message.channel.send("You're on 5sec cooldown");
        }else{
            talked.add(message.author.id);
    switch(cmd)
    {
        case "guilds":
            if(message.author.id!=stubowner) return;
            else{
                bot.guilds.cache.forEach(g=>{
                    message.channel.send(`Guild name: ${g.name} Guild id: ${g.id}`)
                })
            }
        break;
        case "set_bot":
            let iid;
            if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')){
                if(message.guild.channels.cache.find(channel => channel.name === "pins")){
                    message.channel.send(`Channel already exists ${message.guild.channels.cache.find(c=>c.name == 'pins') }`);
                }
                else{
                    await message.guild.channels.create("pins",{type:'text'}).then(c=>{
                        c.createOverwrite(message.guild.id,{SEND_MESSAGES:false,READ_MESSAGES:true})
                        c.createOverwrite(message.guild.roles.cache.find(r=>r.name == "Pin me"),{SEND_MESSAGES:true,READ_MESSAGES:true})
                    });
                    message.channel.send(`Channel created: ${message.guild.channels.cache.find(channel => channel.name === "pins")}`);
                }
            }
            else return message.channel.send(`You do not have correct permission to run this command\nView ${prefix}help for more`)
            break;

        case "pins":
        try{
            if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')){
            if(!message.guild.channels.cache.find(channel=> channel.name === "pins")) return message.channel.send("Channel doesn't exist");
                else {
                let val = [],authid = [],cont = [],avatar = [], channelname = [],url = [],msgurl = [];
                    await message.channel.messages.fetchPinned()
                    .then(async msg =>{
                        msg.forEach(function(value, key){
                        cont.push(value.content);
                        authid.push(value.author.id);
                        val.push(value.author.username);
                        msgurl.push(value.url)
                        channelname.push(value.channel.name);
                        avatar.push(value.author.avatarURL);
                        value.attachments.forEach(function(attachment){
                                url.push(attachment.url);
                            });
                        });
                if(val.length == 0) message.channel.send("No pins in this channel. Try pinning!");
                else{
                    for(i = val.length-1 ; i >=0; i--){
                        const embed = new discord.MessageEmbed()
                        .setTitle("Pinned message")
                        .addField("Author : "+val[i],"Content: "+cont[i])
                        .setColor("RANDOM")
                        .setThumbnail(avatar[i])
                        .addField("Author id: ", authid[i])
                        .addField("AttachmentUrl: ", url[i])
                        .addField("Message Url: ",msgurl[i])
                        .addField("Channel name: ", channelname[i]);
                        message.guild.channels.cache.find(channel=>{
                            if(channel.name === "pins"){
                                bot.channels.cache.get(channel.id).send(embed);
                                }
                            })
                        }
                        await message.channel.send("Pins loaded successfully!");
                    }
                })
                .catch(console.error);
            }
        }else return message.channel.send(`You do not have correct permission to run this command\nView \`\`${prefix}help\`\` for more`)
    }
        catch(err){
            reportdev(err,message);
            message.channel.send("Sorry, I ran into an error, error logs will be sent to developer")
        }
        break;
        case "help":
            if(!args[0]){
            const helpembed = new discord.MessageEmbed()
            .setTimestamp()
            .setColor("RANDOM")
            .setTitle("Pin-me Help")
            .addField("**Available commands**",":warning: More commands will be added in the future")
            .addField(":pushpin: ``set_bot``","creates a channel for pinned messages logging with added permission\n It'll create a category named **``pinned archive``** and a ``pins`` channel\n\n**Permissions for channel**\n It'll deny @everyone from sending messages\n\n**Permission needed:**\n> Administrator")
            .addField(":pushpin: ``pins``","loads pinned messages of the channel in ``pins`` under **``pinned archive``** category\n\n**Embed Info**\nAuthor: Message's author\nContent:Message content\nAuthor id:Message's author id\nUrl: Url for attachments\nChannel name:Pinned message's channel name\n\n**Permission needed:**\n> Administrator")
            .addField(":pushpin: ``ping``","Bot's latency")
            .addField(":pushpin: ``invite``","Invite link for the bot")
            .setDescription("Hello there, ever had urge to pin more messages after hitting the pin cap? Don't worry, I got this, you can safely log pinned message into a separate channel, giving you more space to pin~\nTo get started run ``~set_bot`` command")
            .setFooter("For more, do [prefix] [command_name].");
            message.channel.send(helpembed)
            }
        break;
        case "ping":
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
        break;
        case "invite":
            await message.channel.send("You've got a dm!")
            await message.author.send("Invite me~\nhttps://discordapp.com/api/oauth2/authorize?client_id=558284533326413836&permissions=1543892209&scope=bot");
        break;

        default:
            return;
        }
        setTimeout(()=>{
            console.log("author deleting",message.author.id)
            talked.delete(message.author.id)
        },5000)
        }
    }

});

bot.login(process.env['bot_token']);
