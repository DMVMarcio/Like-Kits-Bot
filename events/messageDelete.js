module.exports = async function (message) {
    let guild = message.guild;
    let channel = guild.channels.get(this.config.messagesChannel)
    let verUser = await this.docDB({type: 1, content: message.author});
    let isSyncUser = verUser.sync.get('on') ? verUser.sync.get('nickname') : 'Não sincronizado';
    let embed = new this.Discord.RichEmbed()
        .setTitle(`Mensagem deletada:`)
        .addField(`Usuário:`, `**${message.author}**\n**Sync:** ${isSyncUser}`, true)
        .addField(`Canal:`, `<#${message.channel.id}>`, true)
        .addField('Mensagem:', message.content, false)
        .setThumbnail(message.author.avatarURL)
        .setFooter(this.user.username, this.user.avatarURL)
        .setTimestamp(Date.now())
        .setColor(7178955);
    channel.send(embed)
}