module.exports = async function (oldMember, newMember) {
    if(!newMember.roles.get(this.config.suportRole)) return;
    let cache = this.cache.get('suportCall').find(cache => cache.id === newMember.user.id) ? this.cache.get('suportCall').find(cache => cache.id === newMember.user.id) : false;
    let guild = newMember.guild;
    let channel = guild.channels.get(this.config.geralChatting);
    let oldChannel = oldMember.voiceChannel;
    let newChannel = newMember.voiceChannel;
    if(oldChannel === newChannel) return;
    if(newChannel === undefined && !cache) return;
    if(newChannel === undefined && cache && oldChannel.parent.id === this.config.suportCategory) {
        let msg = channel.messages.get(cache.msg)
        if(msg) { await msg.delete().catch(e => {}) }
        this.cache.get('suportCall').splice(this.cache.get('suportCall').indexOf(cache), 1)
    } else if(newChannel !== undefined && newChannel.parent.id === this.config.suportCategory && (oldChannel === undefined || oldChannel.parent.id === this.config.suportCategory)) {
        if(!cache) { await this.cache.get('suportCall').push({id: newMember.user.id, msg: null}); cache = this.cache.get('suportCall').find(cache => cache.id === newMember.user.id) };
        if(cache.msg !== null && channel.messages.get(cache.msg)) { channel.messages.get(cache.msg).delete().catch(e => {}) }
        let invite = await newChannel.createInvite({
            maxAge: 600,
            maxUses: 1
        }, `Suporte online: ${newMember.user.tag}`).catch(console.log);
        let embed = new this.Discord.RichEmbed()
            .setTitle('<:LikeKits:383336842197598218> Novo suporte disponível:')
            .setDescription(`O **ajudante** ${newMember} está disponível, **[CLIQUE AQUI PARA CONECTAR!](${invite})**`)
            .setTimestamp(new Date())
            .setFooter(newMember.user.username, newMember.user.avatarURL)
            .setColor(5289);
        channel.send(embed).then(msg => { msg.delete(60000 * 10).catch(e => {}); cache.msg = msg.id })
    } else if(cache && newChannel.parent.id !== this.config.suportCategory) {
        let msg = channel.messages.get(cache.msg)
        if(msg) { await msg.delete().catch(e => {}) }
        this.cache.get('suportCall').splice(this.cache.get('suportCall').indexOf(cache), 1)
    }
}