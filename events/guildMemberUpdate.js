module.exports = async function (oldMember, newMember) {
    let logs = await newMember.guild.fetchAuditLogs({
        type: 'guildMemberUpdate',
        limit: 1
    })
    let log = logs.entries.first();
    if( log.executor.id === this.user.id) return;
    let userDB = await this.docDB({type: 1, content: newMember.user});
    let staffDB = await this.docDB({type: 1, content: log.executor});
    let isSyncUser = userDB.sync.get('on') ? userDB.sync.get('nickname') : 'Não sincronizado';
    let isSyncStaff = staffDB.sync.get('on') ? staffDB.sync.get('nickname') : 'Não sincronizado';
    let guild = newMember.guild;
    let muteChannel = guild.channels.get(this.config.muteChannel);
    let oldRoles = oldMember.roles.map(role => role.id);
    let newRoles = newMember.roles.map(role => role.id);
    if(oldRoles !== newRoles) {
        if(newRoles.filter(role => !oldRoles.includes(role)).length === 0 && oldRoles.filter(role => !newRoles.includes(role)).length === 0) return;
        let addedRole = newMember.guild.roles.get(newRoles.filter(role => !oldRoles.includes(role))[0]);
        let removedRole = newMember.guild.roles.get(oldRoles.filter(role => !newRoles.includes(role))[0]);
        let mute = false;
        let ver = false;
        if(addedRole && addedRole.id === this.config.muteRole) {
            mute = true
            ver = true
        } else if(removedRole && removedRole.id === this.config.muteRole) {
            mute = false
            ver = true
        }
        if(ver) {
            let msg = mute ? 'Usuário mutado' : 'Usuário desmutado';
            let muteEmbed = new this.Discord.RichEmbed()
                .setTitle(`${msg}:`)
                .addField(`Usuário:`, `${newMember}\n**Sync:** ${isSyncUser}`, true)
                .addField(`Responsável`, `${log.executor}\n**Sync:** ${isSyncStaff}`, true)
                .addField('Motivo:', 'Não especificado')
                .setThumbnail(newMember.user.avatarURL)
                .setFooter(log.executor.username, log.executor.avatarURL)
                .setTimestamp(Date.now())
                .setColor(7178955);
            muteChannel.send(muteEmbed)
            userDB.muted.set('on', mute);
        }
    }
    userDB.save()
}