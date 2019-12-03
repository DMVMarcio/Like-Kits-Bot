const { command } = require('../utils');

module.exports = class extends command {
    constructor (name, client) {
        super (name, client)
        this.aliases = ['e', 'execute']
    }
    async run ({message, args}) {
        if(message.author.id !== '337410863545843714') return;
        let result = await eval(args.join(' '))
        console.log(result)
        message.channel.send(`Executado!\n${result}`)
    }
}