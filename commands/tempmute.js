const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['timemute', 'mutetime', 'mutetemp', 'mutemp']
    }
    async run ({message, args}) {
        if(message.member.highestRole.position < message.guild.roles.get("603639384251826216").position) return;
        let reg = args[0] ? args[0].replace(/[^0-9]/g, '') : false;
        let user = reg ? message.guild.members.get(reg) ? message.guild.members.get(reg).user : false : false;
        if(!user) return message.channel.send(`❌ ${message.member}, Você deve **mencionar** o **usuário** que deseja **silenciar**.`).then(msg => { msg.delete(7000); message.delete(7000) });
        let member = message.guild.members.get(user.id);
        let role = message.guild.roles.get(this.client.config.muteRole);
        if(member.roles.get(this.client.config.muteRole)) return message.channel.send(`❌ ${message.member}, O **usuário mencionado** já está **silenciado**.`)
        if((message.member.highestRole.position <= role.position || message.member.highestRole.position <= member.highestRole.position) && message.guild.owner.id !== message.author.id) return message.channel.send(`❌ ${message.member}, Você **não** pode **silenciar** este usuário.`).then(msg => { msg.delete(7000); message.delete(7000) });
        let time = args[1] ? this.client.ms(args.slice(1).join(' ')) : false;
        if(!time) return message.channel.send(`❌ ${message.member}, Especifique o **tempo** que deseja **silenciar** o usuário.`);
        let channel = message.guild.channels.get(this.client.config.muteChannel);
        let userDB = await this.client.docDB({type: 1, content: user});
        member.addRole(role.id);
        userDB.muted.set('on', true)
        userDB.muted.set('temp', true)
        userDB.muted.set('date', Date.now())
        userDB.muted.set('time', time);
        await userDB.save()
        this.client.warnUser(user.id, 12, 25000, 'mute', 'Não especificado', message.author, channel.id, {id: 'muteTime', msTime: this.client.moment(Date.now() + time).format('lll')})
        message.delete(150)
        message.channel.send(`🔇 O **usuário** ${member} foi **silenciado** por ${message.member}.\n**Expira:** \`${this.client.moment(Date.now() + time).format('lll')}\``)
        user.send(`🔇 ${user}, Você foi **silenciado** por ${message.member}.\n**Expira:** \`${this.client.moment(Date.now() + time).format('lll')}\``);
    }
}