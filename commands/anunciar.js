const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['notice', 'anuncio', 'avisar', 'aviso']
    }
    async run ({message, args}) {
        if(message.member.highestRole.position < message.guild.roles.get("429398130073534465").position) return message.channel.send(`❌ ${message.member}, Apenas **gerentes** ou **superiores** podem **enviar anuncios**.`)
        if(!args[0]) return message.channel.send(`❌ ${message.member}, **Como usar:** \`!anunciar <link(opcional)> Titulo | Mensagem\`\nVocê **tambem** pode **enviar** o **arquivo da imagem**.`)
        let link = args[0].startsWith('http') ? args[0] : message.attachments.first() ? message.attachments.first().url : false
        let attach = message.attachments.first() ? true : false
        if(link && !attach) { args.splice(0, 1) }
        let title = message.content.includes('|') ? args.join(' ').split('|')[0] : false;
        let desc = args.join(' ').split('|')[title ? 1 : 0];
        let aviso = new this.client.Discord.RichEmbed()
            .setTimestamp(new Date())
            .setFooter(`Enviado por: ${message.author.tag}`, message.author.avatarURL)
            .setColor(16762880);
        if(title) { aviso.setTitle(title) }
        if(desc) { aviso.setDescription(desc) }
        if(link) {
            aviso.setImage(link)
        }
        let mention = message.channel.id === '361181455587737601' ? true : false
        message.channel.send(`<:LikeKits:383336842197598218> ${message.member}, **Tem certeza** que deseja **enviar** esta **mensagem?** ${mention ? '(menciona everyone)' : ''}`, aviso).then(async msg => {
            const collector = msg.createReactionCollector((r, u) => (r.emoji.name === "✅" || r.emoji.name === "❌") && u.id === message.author.id, { time: 60000 });
            await msg.react('✅')
            await msg.react('❌')
            collector.on('collect', async r => {
                switch(r.emoji.name) {
                    case '✅':
                        message.channel.send(mention ? '@everyone' : '',aviso)
                        break;
                }
                collector.stop()
            })
            collector.on('end', async r => {
                msg.delete()
                message.delete()
            })
        })
    }
}