module.exports = async function () {
    console.log(`[DISCORD] ${this.user.tag} iniciado!`)
    this.user.setPresence({game: { name: `${this.users.size} membros!`, type: 1 }})
    let last = await this.fetch(`https://likekits-api.glitch.me/discord/bans/last?token=${process.env.api}`, {
        method: 'GET'
    }).then(res => res.json())
    this.saveBans = last.id
    this.startVerifys()
}