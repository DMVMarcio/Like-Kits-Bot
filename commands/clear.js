const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['limpar']
    }
    async run ({message, args}) {
        if(!message.member.hasPermission(['MANAGE_MESSAGES'])) return;
        let noArgs = new this.client.Discord.RichEmbed()
            .setTitle(`<:LikeKits:383336842197598218> Deletar mensagens:`)
            .setDescription(`**Você** deve especificar **um número** de \`1 à 100\` para **deletar** as mensagens.`)
            .setTimestamp(new Date())
            .setFooter(message.author.username, message.author.avatarURL)
            .setColor(16762880)
        if(!args[0]) return message.channel.send(noArgs).then(msg => { msg.delete(7000); message.delete(7000) });
        let quantidade = args[0]
        if(!Number(quantidade)) return message.channel.send(`❌ ${message.member}, O **argumento** \`${args[0]}\` **não é um número**.`).then(msg => { msg.delete(7000); message.delete(7000) });
        if(quantidade <= 0 || quantidade > 100) {
            quantidade = 100
        }
        quantidade = parseInt(quantidade)
        await message.delete()
        setTimeout(async () => {
            await message.channel.bulkDelete(quantidade)
            message.channel.send(`<:LikeKits:383336842197598218> Foram **apagadas** \`${quantidade} mensagens\` por ${message.member}.`).then(msg => { msg.delete(7000); });
        }, 800)
    }
}