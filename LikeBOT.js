const { Client, Collection } = require('discord.js')
const { readdirSync, statSync } = require('fs')
module.exports = class Like extends Client {
    constructor (options = {}) {
        super (options)
        this.commands = new Collection()
        this.Discord = require('discord.js')
        this.database = require('./database.js')
        this.config = require('./global.json')
        this.fetch = require('node-fetch')
        this.ms = require('ms')
        this.moment = require('moment')
        this.moment.locale('pt-BR')
        this.warns = []
        this.cache = new Map()
            .set('suportCall', [])
        this.saveBans = 0
        this.initializeEvents('./events')
        this.initializeCommands('./commands')
    }
    async docDB (doc) {
        switch (doc.type) {
            case 1:
                if (doc.content.bot) return;
                const userCheck = await this.database.Users.findOne({'_id': doc.content.id})
                if (userCheck) return userCheck;
                const usuario = new this.database.Users({
                    _id: doc.content.id,
                    sync: {on: false, nickname: 'None', code: 'None', id: 'None'},
                    muted: {on: false, temp: false, date: 0, time: 0}
                }); await usuario.save(); return usuario;
                break;
            case 2:
                const guildCheck = await this.database.Guilds.findOne({'_id': doc.content.id})
                if (guildCheck) return guildCheck;
                const servidor = new this.database.Guilds({
                    _id: doc.content.id
                }); await servidor.save(); return servidor;
                break;
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async warnUser(user_id, count = 1, time = 85000, action = 'ban', reason = 'Anti-Raid', executor = this.user, channel_id = this.config.punishsChannel, params = false) {
        let warn = this.warns.find(user => user.id === user_id) ? this.warns.find(user => user.id === user_id) : false;
        if(!warn) { await this.warns.push({id: user_id, warns: 0}); warn = this.warns.find(user => user.id === user_id) }
        let guild = this.guilds.get(this.config.likeGuild);
        let channel = guild.channels.get(channel_id);
        let member = guild.members.get(user_id);
        let punishments = {'ban': 'Usuário banido', 'mute': 'Usuário mutado'};
        let verUser = await this.docDB({type: 1, content: member.user});
        let verStaff = executor.id === this.user.id ? false : await this.docDB({type: 1, content: executor});
        warn.warns += count
        setTimeout(() => { warn.warns -= count }, time)
        if(warn.warns >= 12) {
            switch(action) {
                case 'ban':
                    member.ban(reason)
                    break;
                case 'mute':
                    member.addRole(this.config.muteRole, reason)
                    verUser.muted.set('on', true)
                    break;
            }
            let isSyncUser = verUser.sync.get('on') ? verUser.sync.get('nickname') : 'Não sincronizado',
                embed = new this.Discord.RichEmbed()
                    .setTitle(`${punishments[action]}:`)
                    .addField('Usuário:', `**${member}**\n**Sync:** ${isSyncUser}`, true)
                    .setThumbnail(member.user.avatarURL)
                    .setFooter(this.user.username, this.user.avatarURL)
                    .setTimestamp(Date.now())
                    .setColor(7178955);
            if(verStaff) {
                let isSyncStaff = verStaff.sync.get('on') ? verStaff.sync.get('nickname') : 'Não sincronizado';
                embed.addField('Responsável:', `**${executor}**\n**Sync:** ${isSyncStaff}`, true);
            } else if(executor.id === this.user.id) {
                embed.addField('Responsável:', `**${this.user}**`, true);
            }
            if(params) {
                switch(params.id) {
                    case 'muteTime':
                        embed.addField('Expira:', params.msTime, true)
                        break;
                }
            }
            embed.addField('Motivo:', reason, true)
            verUser.save()
            channel.send(embed)
        }
    }
    async startVerifys() {
        let guild = this.guilds.get(this.config.likeGuild)
        setInterval(() => {
            let members = guild.members.array().filter(member => !member.roles.get('429639084571623426')).slice(0, 10);
            members.forEach(async member => {
                let timeout = Math.floor((Math.random() * (15 - 0.01)) * 1000) + 10;
                await this.sleep(timeout);
                member.addRole('429639084571623426')
            })
            if(guild.members.array().filter(member => member.roles.get('429639084571623426')).length !== guild.members.size) {
                console.log(`[MEMBROS] Usuários com o cargo: ${guild.members.array().filter(member => member.roles.get('429639084571623426')).length}/${guild.members.size}`)
            }
        }, 30000)
        setInterval(async() => {
            let users = await this.database.Users.find({'muted.on': true, 'muted.temp': true})
            users.forEach(async user => {
                if(Date.now() >= (user.muted.get('date') + user.muted.get('time'))) {
                    let member = guild.members.get(user._id)
                    if(member) {
                        member.removeRole(this.config.muteRole)
                        member.user.send(`🔇 ${member.user}, Você foi **desmutado**, seu tempo de **silencio** acabou.`)
                    }
                    user.muted.set('on', false)
                    user.muted.set('temp', false)
                    user.save()
                }
            })
        }, 60 * 1000)
        setInterval(async () => {
            try {
                let last = await this.fetch(`https://api/discord/bans/last?token=${process.env.api}`, {
                    method: 'GET'
                }).then(res => res.json()),
                    reports = await this.fetch(`https://api/discord/reports?token=${process.env.api}`, {
                        method: 'GET'
                    }).then(res => res.json()),
                    vips = await this.fetch(`https://api/discord/vips?token=${process.env.api}`, {
                        method: 'GET'
                    }).then(res => res.json());
                const verifieds = await this.database.Users.find({'sync.on': true})
                verifieds.forEach(async userDB => {
                    let timeout = Math.floor((Math.random() * (15 - 0.01)) * 1000) + 10;
                    await this.sleep(timeout);
                    let member = guild.members.get(userDB._id),
                        arr = vips[userDB.sync.get('id')];
                    if(member.roles.get(this.config.masterRole) && arr && arr !== 'master') {
                        member.removeRole(this.config.masterRole)
                        member.addRole(this.config[`${arr}Role`])
                    } else if(member.roles.get(this.config.proRole) && arr && arr !== 'pro') {
                        member.removeRole(this.config.proRole)
                        member.addRole(this.config[`${arr}Role`])
                    } else if(arr && !member.roles.get(this.config.proRole) && !member.roles.get(this.config.masterRole)) {
                        member.addRole(this.config[`${arr}Role`])
                    } else if(!arr && (member.roles.get(this.config.proRole) || member.roles.get(this.config.masterRole))) {
                        member.removeRole(this.config.masterRole)
                        member.removeRole(this.config.proRole)
                    }
                })
                reports.forEach(async report => {
                    let verUser = await this.database.Users.findOne({'sync.nickname': report.accused});
                    let verRes = await this.database.Users.findOne({'sync.nickname': report.player});
                    let isSyncUser = verUser ? guild.members.get(verUser._id) : 'Não sincronizado';
                    let isSyncRes = verRes ? guild.members.get(verRes._id) : 'Não sincronizado';
                    let embed = new this.Discord.RichEmbed()
                        .setTitle(`Novo report recebido:`)
                        .addField(`Acusado:`, `${report.accused}\n**Sync:** ${isSyncUser}`, true)
                        .addField(`Responsável:`, `${report.player}\n**Sync:** ${isSyncRes}`, true)
                        .addField('Motivo:', report.reason, true)
                        .addField(`Servidor:`, report.server, true)
                        .setThumbnail('https://i.imgur.com/9hLgrzr.png')
                        .setFooter(this.user.username, this.user.avatarURL)
                        .setTimestamp(Date.now())
                        .setColor(65280);
                    guild.channels.get(this.config.reportChannel).send(embed)
                })
                if(this.saveBans !== 0) {
                    if(this.saveBans === last.id) return;
                    let json = await this.fetch(`https://api/discord/bans/${this.saveBans}?token=${process.env.api}`, {
                        method: 'GET'
                    }).then(res => res.json())
                    json.forEach(async req => {
                        let verUser = await this.database.Users.findOne({'sync.nickname': req.player});
                        let verRes = await this.database.Users.findOne({'sync.nickname': req.staffer});
                        let isSyncUser = verUser ? guild.members.get(verUser._id) : 'Não sincronizado';
                        let isSyncRes = verRes ? guild.members.get(verRes._id) : 'Não sincronizado';
                        let embed = new this.Discord.RichEmbed()
                            .setTitle(`Novo banimento recebido:`)
                            .addField(`Usuário:`, `${req.player}\n**Sync:** ${isSyncUser}`, true)
                            .addField(`Responsável:`, `${req.staffer}\n**Sync:** ${isSyncRes}`, true)
                            .addField('Motivo:', req.motivo, true)
                            .addField(`Expira:`, req.expira, true)
                            .setThumbnail('https://i.imgur.com/9hLgrzr.png')
                            .setFooter(this.user.username, this.user.avatarURL)
                            .setTimestamp(Date.now())
                            .setColor(65280)
                        guild.channels.get(this.config.banChannel).send(embed)
                    })
                    this.saveBans = last.id
                } else {
                    this.saveBans = last.id
                }
            } catch(e) {}
        }, 30 * 1000)
    }
    initializeCommands (path) {
        readdirSync(path).forEach(file => {
            try {
                const filePath = path + '/' + file
                if (file.endsWith('.js')) {
                    const Command = require(filePath)
                    const commandName = file.replace(/.js/g,'').toLowerCase()
                    const command = new Command(commandName, this)
                    this.commands.set(commandName, command)
                } else if (statSync(filePath).isDirectory()) {
                    this.initializeCommands(filePath)
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
    initializeEvents (path) {
        readdirSync(path).forEach(file => {
            try {
                let filePath = path + '/' + file
                if (file.endsWith('.js')) {
                    let Listener = require(filePath)
                    this.on(file.replace(/.js/g, ''), Listener)
                } else if (statSync(filePath).isDirectory()) {
                    this.initializeEvents(filePath)
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
}
