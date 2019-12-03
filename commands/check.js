const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['userinfo', 'player', 'user']
    }
    async run ({message, args}) {
        let reg = args[0] ? args[0].replace(/[^0-9]/g, '') : message.author.id;
        let user = message.guild.members.get(reg) ? message.guild.members.get(reg).user : message.author;
        if(user.bot) { user = message.author }
        let userDB = await this.client.docDB({type: 1, content: user});
        let member = message.guild.members.get(user.id);
        let sync = userDB.sync.get('on') ? {nickname: userDB.sync.get('nickname'), uuid: userDB.sync.get('id'), group: 'None', names: null} : false;
        let embed = new this.client.Discord.RichEmbed()
            .setTitle(`Informações de ${user.tag}:`)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.avatarURL)
            .setColor(16762880);
        let lastType = 'discord';
        let forceStop = false;
        if(sync) {
            try {
                let mc = await this.client.fetch(`https://mc-heads.net/minecraft/profile/${sync.nickname}`, {
                    method: 'GET'
                }).then(res => res.json())
                sync.names = mc.name_history
                let json = await this.client.fetch(`https://api/discord/grupo/${sync.uuid}?token=${process.env.api}`, {
                    method: 'GET'
                }).then(res => res.json())
                sync.group = json.grupo.toUpperCase()
            } catch(e) {
                let json = await this.client.fetch(`https://api/discord/name/${sync.uuid}?token=${process.env.api}`, {
                    method: 'GET'
                }).then(res => res.json())
                userDB.sync.set('nickname', json.name)
                userDB.save()
                forceStop = true
            }
        }
        if(forceStop) return message.channel.send(`🕵 ${message.member}, **Ocorreu um erro**, **tente novamente** mais tarde.`)
        const getInfo = async(type) => {
            embed.fields = []
            switch(type) {
                case 'discord':
                    embed.setThumbnail(user.avatarURL)
                        .addField('<:Discord:606964896269074539> ID de usuário:', `\`${user.id}\``, true)
                        .addField('📑 Cargo mais alto:', `\`${member.highestRole.name.toUpperCase()}\``, true)
                        .addField('📆 Criação da conta:', `${this.client.moment(user.createdAt).format('lll')}`, true)
                        .addField('🌟 Entrou no Servidor:', `${this.client.moment(member.joinedAt).format('lll')}`, true)
                        .addField('🗒 Cargos no Discord:', member.roles.map(role => `\`${role.name}\``).join(' **|** '), false)
                        .setColor(7178955)
                    break;
                case 'minecraft':
                    embed.setThumbnail(`https://minotar.net/avatar/${sync.nickname}.png`)
                        .addField('<:Minecraft:606973031474003969> Nickname:', `\`${sync.nickname}\``, true)
                        .addField('🗒 Cargo:', `\`${sync.group}\``, true)
                        .addField('📑 UUID', `\`${sync.uuid}\``)
                        .addField('🕵 Histórico de nomes:', sync.names.map(name => `\`${name.name}\``).join(' **|** '))
                    break;
            }
            return embed;
            };
        message.channel.send(await getInfo(lastType)).then(async msg => {
            if(!sync) return;
            await msg.react(':Discord:606964896269074539')
            await msg.react(':Minecraft:606973031474003969')
            await msg.react('✖')
            const collector = msg.createReactionCollector((r, u) => (r.emoji.id === '606964896269074539' || (sync && r.emoji.id === '606973031474003969') || r.emoji.name === '✖') && u.id === message.author.id, { time: 60000 })
            collector.on('collect', async r => {
                if(r.emoji.name === '✖') return collector.stop();
                r.remove(r.users.last().id).catch(e => {})
                if(lastType === r.emoji.name.toLowerCase()) return;
                lastType = r.emoji.name.toLowerCase()
                msg.edit(await getInfo(lastType))
            })
            collector.on('end', async r => {
                msg.delete().catch(e => {})
                message.delete().catch(e => {})
            })
        })
    }
}
