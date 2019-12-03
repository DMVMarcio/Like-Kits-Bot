const { command } = require('../utils');
const inSync = [];

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['sincronizar']
    }
    async run ({message, usuario}) {
        if(inSync.includes(message.author.id)) return message.channel.send(`<:LikeKits:383336842197598218> ${message.member}, Você **já está** com uma **sessão de sincronização** aberta.`)
        if(usuario.sync.get('on')) return message.channel.send(`❌ ${message.member}, Você já está **sincronizado** com a **conta** \`${usuario.sync.get('nickname')}\``).then(msg => { msg.delete(7000); message.delete(7000) });
        try {
            message.delete(1500).catch(e => {})
            let msgStart = await message.channel.send(`<:LikeKits:383336842197598218> ${message.member}, **Verifique** as suas **mensagens diretas** para **continuar**.`);
            let force = false;
            message.author.send(`<:LikeKits:383336842197598218> ${message.member}, Envie **abaixo** o **código de sincronização** de **sua conta**.`).then(async msgDM => {
                inSync.push(message.author.id)
                const collector = msgDM.channel.createMessageCollector((m) => m, { time: 60000 });
                collector.on('collect', async m => {
                    let json = await this.client.fetch(`https://api/discord/validar/${m.content}?token=${process.env.api}`, {
                        method: 'GET'
                    }).then(res => res.json()).catch(e => {return {found: false};})
                    if(!json.found) return message.author.send(`❌ ${message.member}, Este **código** é **inválido** tente **enviar novamente**.`).then(msg => msg.delete(7000));
                    usuario.sync.set('nickname', json.name)
                    usuario.sync.set('on', true)
                    usuario.sync.set('id', json.uniqueId)
                    usuario.sync.set('code', m.content)
                    usuario.save()
                    force = true
                    if(!message.member.roles.get('440954508324110357')) {message.member.addRole('440954508324110357')}
                    message.author.send(`<:LikeKits:383336842197598218> ${message.member}, Seu **discord** foi **sincronizado** com a **conta** \`${json.name}\`.`);
                    collector.stop()
                })
                collector.on('end', async m => {
                    inSync.splice(inSync.indexOf(message.author.id), 1)
                    msgStart.delete().catch(e => {})
                    msgDM.delete().catch(e => {})
                    if(!force) {message.channel.send(`<:LikeKits:383336842197598218> ${message.member}, **Tempo de resposta** foi **esgotado**, tente novamente.`).then(msg => { msg.delete(7000) })}
                })
            }).catch(e => {
                message.channel.send(`❌ ${message.member}, **Por favor**, ative as suas **mensagens diretas** para podermos fazer a **verificação**.`).then(msg => { msg.delete(7000); message.delete(7000) });
            })
        } catch(e) {
            message.channel.send(`❌ ${message.member}, **Por favor**, ative as suas **mensagens diretas** para podermos fazer a **verificação**.`).then(msg => { msg.delete(7000); message.delete(7000) });
        }
    }
}
