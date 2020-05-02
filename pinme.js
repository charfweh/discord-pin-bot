const discord = require("discord.js");
const bot = new discord.Client({disableEveryone : true});
const owner= process.env.owner
const prefix = process.env.prefix
bot.on("ready", async ()=> {
    console.log('wohoo i am ready to senpai!');
    bot.users.get(owner).send(`Im up${bot.uptime}`)
    bot.user.setActivity("Extracting pins | ~help to view more", {type : "PLAYING"});
    bot.user.setStatus("online");
});
/*
    TODOS
    edit help command
    make it more user friendly
    add title
    change desc
*/
bot.on("message", async message=> {

    function reportdev(err,message){
        const reportembed = new discord.RichEmbed()
        .setTitle("Error encountered")
        .addField("Server name",message.guild.name)
        .addField("Server id",message.guild.id)
        .addField("Error",err)
        .setColor('RANDOM');
        bot.users.get(owner).send(reportembed);
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd  = args.shift().toLowerCase();
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    if(message.channel.type == 'dm') return
    switch(cmd)
    {   
        case "invite":
            message.author.send('https://discordapp.com/api/oauth2/authorize?client_id=558284533326413836&permissions=1543892209&scope=bot');
        break;
        case "set_bot":
            let iid;
            if(message.guild.channels.find(channel => channel.name === "pins")) return message.channel.send("Channel already exists.");
            else{
                let cat = await message.guild.createChannel("pinned archive",'category');
                await message.guild.createChannel("pins",'text').then(c=>{
                    c.setParent(cat.id)
                    c.overwritePermissions(message.guild.id,{SEND_MESSAGES:false,READ_MESSAGES:true})
                    c.overwritePermissions(message.guild.roles.find(r=>r.name == "Pin me"),{SEND_MESSAGES:true,READ_MESSAGES:true})
                });
                iid = message.guild.channels.find(channel => channel.name === "pins");
                message.channel.send(`Channel created: <#${iid.id}>.`);
                //message.author.send("Be sure to set parent of pins channel, i.e move channel to particular category.")
            }
            break;
        
        case "pins":
        try{   
            
            if(!message.guild.channels.find(channel=> channel.name === "pins")) message.channel.send("Channel doesn't exist.");
                else {
                let val = [],authid = [],cont = [],avatar = [], channelname = [],url = [];
                    await message.channel.fetchPinnedMessages() 
                    .then(msg =>{
                        msg.forEach(function(value, key){
                        //if(cont.length==0){ cont.push("null")}
                        cont.push(value);
                        authid.push(value.author.id);
                        val.push(value.author.username);
                        channelname.push(value.channel.name);
                        avatar.push(value.author.avatarURL);
                        value.attachments.forEach(function(attachment){
                                url.push(attachment.url);
                            });
                        });
                if(val.length == 0) message.channel.send("No pins in this channel. Try pinning!");
                else{
                    for(i = 0 ; i < val.length; i++){
                        const embed = new discord.RichEmbed()
                        .setTitle("Pinned message")
                        .addField("Author : "+val[i],"Content: "+cont[i])
                        .setColor("RANDOM")
                        .setThumbnail(avatar[i])
                        .addField("Author id: ", authid[i])
                        .addField("Url: ", url[i])
                        .addField("Channel name: ", channelname[i]);
                        message.guild.channels.find(channel=>{
                            if(channel.name === "pins"){
                                let iiid = channel.id;
                                bot.channels.get(iiid).send(embed);
                                } 
                            })
                        }
                        message.channel.send("Pins loaded successfully!");
                    }
                })
                .catch(console.error);
            }
        }catch(err){
            reportdev(err,message);
            message.channel.send("Sorry, I ran into an error, it'll be reported to developer")
        }
        break;
        case "help":
            if(!args[0]){
            const helpembed = new discord.RichEmbed()
            .setAuthor(message.guild.me.user.username,message.guild.me.user.avatarURL)
            .setTimestamp()
            .setColor("RANDOM")
            .setThumbnail(message.author.avatarURL)
            .setTitle("Pin-me Help")
            .addField("**Available commands**",":warning: More commands will be added in the future")
            .addField(":pushpin: ``set_bot``","creates a channel for pinned messages logging with added permission\n It'll create a category named **``pinned archive``** and a ``pins`` channel\n**Permissions**\n It'll deny @everyone from sending messages")
            .addField(":pushpin: ``pins``","loads pinned messages of the channel in ``pins`` under **``pinned archive``** category\n**Embed Info**\nAuthor: Message's author\nContent:Message content\nAuthor id:Message's author id\nUrl: Url for attachments\nChannel name:Pinned message's channel name")
            .addField(":pushpin: ``suggestion``","Your lovely suggestion will be sent to Bot's owner")
            .addField(":pushpin: ``ping``","Bot's latency")
            .addField(":pushpin: ``invite``","Bot's invite link")
            .setFooter("For more, do [prefix] [command_name].")
            .setDescription("Hello there, ever had urge to pin more messages after hitting the pin cap? Don't worry, I got this, you can safely log pinned message into a separate channel, giving you more space to pin~\nTo get started run ``~set_bot`` command");
            message.channel.send(helpembed);
            }
        break;
        case "suggestion":
        if(message.channel.type!='dm')
        message.channel.send("Command works in dm-only");
        if(message.channel.type=='dm')
        {
                message.author.send("Please enter your suggestion, you've 1 minute");
                const feedbackcollector = new discord.MessageCollector(message.channel, m=>m.author.id === message.author.id, {max:1,time:60000});
                feedbackcollector.on('collect',feedcollect=>{
                feedback = feedcollect.toString();
                const feedembed = new discord.RichEmbed()
                .setAuthor("Feedback from:")
                .setColor("RANDOM")
                .setThumbnail(message.author.avatarURL)
                .addField(message.author.tag+"'s Feedback:",feedback)
                .addField("Author's id:",message.author.id)
                .setTimestamp()
                bot.users.get('407170811787608064').send(feedembed);
                message.author.send("Your suggestion has been sent, Thank you.");
               
            })
                feedbackcollector.on('end',msg=>{
                    message.author.send("Command timed out.");
                })
        }
       
        break;
        case "ping":
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
        break;
        
    }

});

bot.login(process.env.bot_token);

