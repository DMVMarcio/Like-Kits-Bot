module.exports = async function (guild, user) {
    let logs = await guild.fetchAuditLogs({
        type: 'guildBanAdd',
        limit: 1
    })
    let log = logs.entries.first();
    let verUser = await this.docDB({type: 1, content: user});
    let verStaff = await this.docDB({type: 1, content: log.executor});
    let isSyncUser = verUser.sync.get('on') ? verUser.sync.get('nickname') : 'Não sincronizado';
    let isSyncStaff = verStaff.sync.get('on') ? verStaff.sync.get('nickname') : 'Não sincronizado';
    let embed = new this.Discord.RichEmbed()
        .setTitle(`Novo banimento recebido:`)
        .addField(`Usuário:`, `**${user.tag}**\n**Sync:** ${isSyncUser}`, true)
        .addField(`Responsável:`, `${log.executor}\n**Sync:** ${isSyncStaff}`, true)
        .addField('Motivo:', log.reason !== null ? log.reason : 'Não especificado', true)
        .setThumbnail('https://i.imgur.com/0vvzGCY.png')
        .setFooter(this.user.username, this.user.avatarURL)
        .setTimestamp(Date.now())
        .setColor(7178955);
    guild.channels.get(this.config.banChannel).send(embed)
}