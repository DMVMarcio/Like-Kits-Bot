const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['desmutar', 'desmute']
    }
    async run ({message, args, usuario}) {
        if(message.member.highestRole.position < message.guild.roles.get("603639384251826216").position) return;
        let reg = args[0] ? args[0].replace(/[^0-9]/g, '') : false;
        let user = reg ? message.guild.members.get(reg) ? message.guild.members.get(reg).user : false : false;
        if(!user) return message.channel.send(`❌ ${message.member}, Você deve **mencionar** o **usuário** que deseja **desmutar**.`).then(msg => { msg.delete(7000); message.delete(7000) });
        let member = message.guild.members.get(user.id);
        let role = message.guild.roles.get(this.client.config.muteRole);
        if(!member.roles.get(this.client.config.muteRole)) return message.channel.send(`❌ ${message.member}, O **usuário mencionado** não está **silenciado**.`)
        let channel = message.guild.channels.get(this.client.config.muteChannel);
        let userDB = await this.client.docDB({type: 1, content: user});
        let isSyncUser = userDB.sync.get('on') ? userDB.sync.get('nickname') : 'Não sincronizado';
        let isSyncStaff = usuario.sync.get('on') ? usuario.sync.get('nickname') : 'Não sincronizado';
        let muteEmbed = new this.client.Discord.RichEmbed()
            .setTitle(`Usuário desmutado:`)
            .addField(`Usuário:`, `${user}\n**Sync:** ${isSyncUser}`, true)
            .addField(`Responsável`, `${message.member}\n**Sync:** ${isSyncStaff}`, true)
            .setThumbnail(user.avatarURL)
            .setFooter(message.author.username, message.author.avatarURL)
            .setTimestamp(Date.now())
            .setColor(7178955);
        member.removeRole(role.id);
        userDB.muted.set('on', false)
        userDB.muted.set('temp', false)
        userDB.save()
        message.delete(150)
        message.channel.send(`🔇 O **usuário** ${member} foi **desmutado** por ${message.member}.`)
        user.send(`🔇 ${user}, Você foi **desmutado** por ${message.member}.`);
        channel.send(muteEmbed)
    }
}