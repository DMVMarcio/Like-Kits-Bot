const antiSpam = [];
module.exports = async function (message) {
    if (message.channel.type === 'dm') return;
    if (message.author.bot) return;
    let args = message.content.split(' ').slice(1);
    let usuario = await this.docDB({type: 1, content: message.author});
    let servidor = await this.docDB({type: 2, content: message.guild});
    if(message.content.startsWith(this.config.prefix)) {
        if(message.content === this.config.prefix) return;
        let command = message.content.split(' ')[0].slice(this.config.prefix.length)
        try {
            let prefix = this.config.prefix;
            let commandRun = this.commands.find(c => c.name === command || c.aliases.includes(command))
            if(commandRun) {
                commandRun.process({message, args, usuario, servidor, prefix});
            }
        } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') return;
            console.error(err)
        }
    } else {
        let invitesType = ['discord.gg/', 'discordapp.com/invite/', 'discord.me/']
        let invitesServer = await message.guild.fetchInvites()
        if(invitesType.some(type => message.content.includes(type)) && !invitesServer.some(invite => message.content.includes(invite)) && message.author.id !== message.guild.owner.id) {
            message.delete(100).catch(e => {})
            message.channel.send(`${message.member}, você **não pode** enviar **convite** de outros **servidores** aqui. 😒`).then(msg => msg.delete(7000))
            this.warnUser(message.author.id, 4, 25000, 'ban', `Divulgação no canal <#${message.channel.id}>.`)
        }
        let ant = antiSpam.find(ant => ant.user.id === message.author.id) ? antiSpam.find(ant => ant.user.id === message.author.id) : false;
        if(!ant) { await antiSpam.push({user: message.author, messages: 1}); ant = antiSpam.find(ant => ant.user.id === message.author.id) }
        ant.messages += 1
        let spamTime = setTimeout(() => { ant.messages -= 1 }, 6000)
        if(ant.messages >= 7) {
            clearTimeout(spamTime);
            antiSpam.splice(antiSpam.indexOf(ant), 1)
            this.warnUser(message.author.id, 12, 25000, 'mute', `**FLOOD/SPAM** no canal <#${message.channel.id}>.`)
            message.channel.send(`🔇 ${message.member}, Você foi **mutado** por **suspeita** de **FLOOD/SPAM** pelo **bot**.`).catch(e => {})
            message.author.send(`🔇 ${message.member}, Você foi **mutado** por **suspeita** de **FLOOD/SPAM** pelo **bot**.`).catch(e => {})
            message.channel.fetchMessages().then(async messages => {
                let list = messages.array().filter(msg => msg.author.id === message.author.id)
                await message.channel.bulkDelete(list)
            })
        }
    }
}