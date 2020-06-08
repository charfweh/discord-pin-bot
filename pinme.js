const discord = require("discord.js");
const bot = new discord.Client({disableEveryone : true});
const owner= process.env.owner
const cmdfile = require('./botconfig.json')
const fs = require('fs')
const talked = new Set();
const prefix = process.env.prefix
bot.on("ready", async ()=> {
    console.log('wohoo i am ready to senpai!');
    bot.users.get(owner).send(`Im up${bot.uptime} with cmds ${cmdfile.cmdname.length}`)
    bot.user.setActivity("Extracting pins | ~help to view more", {type : "PLAYING"});
    bot.user.setStatus("online");
    bot.guilds.forEach(g=>{
        bot.users.get(owner).send(`Guild name ${g.name}`);
    })
});
bot.on('guildCreate', async(guild)=>{
  bot.channels.get('719408160380813343').send(`Joined a guild ${guild.name}`)
})

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
    if(message.content.startsWith(prefix) && cmdfile.cmdname.includes(cmd)){
    if(talked.has(message.author.id)){
        message.channel.send("You're on 5sec cooldown").then(m=>m.delete(2000))
    }else{
        talked.add(message.author.id);
    switch(cmd)
    {
        case "guilds":
            if(message.author.id!=owner) return;
            else{
                bot.guilds.forEach(g=>{
                    message.channel.send(`Guild name: ${g.name}nGuild id: ${g.id}`)
                })
            }
            console.log("hm");
        break;
        case "set_bot":
            let iid;
            if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')){
                if(message.guild.channels.find(channel => channel.name === "pins")){
                    let chnl = message.guild.channels.find(c=>c.name == 'pins').id;
                    message.channel.send(`Channel already exists <#${chnl}>`);

                }
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
            }
            else{
                message.channel.send(`You do not have correct permission to run this command\nView ${prefix}help for more`)
            }
            break;

        case "pins":
        try{
            if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')){
            if(!message.guild.channels.find(channel=> channel.name === "pins")) message.channel.send("Channel doesn't exist");
                else {
                let val = [],authid = [],cont = [],avatar = [], channelname = [],url = [],msgurl = [];
                    await message.channel.fetchPinnedMessages()
                    .then(async msg =>{
                        msg.forEach(function(value, key){
                        //if(cont.length==0){ cont.push("null")}
                        cont.push(value);
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
                    for(i = 0 ; i < val.length; i++){
                        const embed = new discord.RichEmbed()
                        .setTitle("Pinned message")
                        .addField("Author : "+val[i],"Content: "+cont[i])
                        .setColor("RANDOM")
                        .setThumbnail(avatar[i])
                        .addField("Author id: ", authid[i])
                        .addField("AttachmentUrl: ", url[i])
                        .addField("Message Url: ",msgurl[i])
                        .addField("Channel name: ", channelname[i]);
                        message.guild.channels.find(channel=>{
                            if(channel.name === "pins"){
                                let iiid = channel.id;
                                bot.channels.get(iiid).send(embed);
                                }
                            })
                        }
                        await message.channel.send("Pins loaded successfully!");
                    }
                })
                .catch(console.error);
            }
        }else{
            message.channel.send(`You do not have correct permission to run this command\nView \`\`${prefix}help\`\` for more`)
        }
    }

        catch(err){
            reportdev(err,message);
            message.channel.send("Sorry, I ran into an error, error logs will be sent to developer")
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
            .addField(":pushpin: ``set_bot``","creates a channel for pinned messages logging with added permission\n It'll create a category named **``pinned archive``** and a ``pins`` channel\n\n**Permissions for channel**\n It'll deny @everyone from sending messages\n\n**Permission needed:**\n> Administrator")
            .addField(":pushpin: ``pins``","loads pinned messages of the channel in ``pins`` under **``pinned archive``** category\n\n**Embed Info**\nAuthor: Message's author\nContent:Message content\nAuthor id:Message's author id\nUrl: Url for attachments\nChannel name:Pinned message's channel name\n\n**Permission needed:**\n> Administrator")
            .addField(":pushpin: ``ping``","Bot's latency")
            .addField(":pushpin: ``invite``","Invite link for the bot")
            .setFooter("For more, do [prefix] [command_name].")
            .setDescription("Hello there, ever had urge to pin more messages after hitting the pin cap? Don't worry, I got this, you can safely log pinned message into a separate channel, giving you more space to pin~\nTo get started run ``~set_bot`` command");
            message.channel.send(helpembed);
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
        case "sendfile":
         await message.channel.send("Working on it...")
            try {
              fs.access(`./${message.channel.name}`,(err)=>{
                  if(err){
                      //if the file doesnt exist make a new one and add pins to it
                      console.log("FIle doesnt exist")
                      message.channel.fetchPinnedMessages()
                      .then(async msg=>{
                          if(msg.size == 0){
                              message.channel.send("no pins, try pinning")
                              return;
                          }
                          let authid = [], authname = [], cont = []
                          msg.forEach((v,k)=>{
                              authid.push(v.author.id)
                              authname.push(v.author.name)
                              cont.push(v)
                              let data = `author name:${authname.pop()}\nauthor id:${authid.pop()}\ncontent:${cont.pop()}`
                              fs.appendFile(`./${message.channel.name}`,data,(err)=>{
                                  if(err){
                                      message.channel.send("NOpe")
                                      console.log(err)
                                  }
                              })
                          })
                          await message.channel.send("Yea im done")
                          await message.channel.send("Pins saved")
                          await message.channel.send({
                          files:[{
                              attachment:`./${message.channel.name}pins`,
                              name:`${message.guild.name}_${message.channel.name} pins.txt`
                              }]
                          });
                      }).catch(err=>console.log(err))
                      return;
                  }
                      // if the file does exists, delete the file and make a new one and then add data to it
                      fs.unlink(`./${message.channel.name}`,(err)=>{
                          if(err){
                              message.channel.send("We ran into an error, I'll let developer know~")
                              reportdev(err,msg)
                          }
                          console.log("Deleted")
                      })
                      message.channel.fetchPinnedMessages()
                      .then(async msg=>{
                          if(msg.size == 0){
                              message.channel.send("no pins, try pinning")
                          }
                          let authid = [], authname = [], cont = []
                          msg.forEach((v,k)=>{
                              authid.push(v.author.id)
                              authname.push(v.author.name)
                              cont.push(v)
                              let data = `author name:${authname.pop()}\nauthor id:${authid.pop()}\ncontent:${cont.pop()}`
                              fs.appendFile(`./${message.channel.name}`,data,(err)=>{
                                  if(err){
                                      message.channel.send("NOpe")
                                      console.log(err)
                                      reportdev(err,msg)
                                  }
                              })
                          })
                          await message.channel.send("Pins saved")
                          await message.channel.send({
                          files:[{
                              attachment:`./${message.channel.name}pins`,
                              name:`${message.guild.name}_${message.channel.name} pins.txt`
                              }]
                          });
                      }).catch(err=>console.log(err))
              })
            } catch (e) {
              message.channel.send("Sorry, I ran into an error, error logs will be sent to developer")
              reportdev(e,message)
            }
        break;
        default:
            return;
        }
            setTimeout(()=>{
                talked.delete(message.author.id)

            },5000)
        }
    }

});

bot.login(process.env.bot_token);
