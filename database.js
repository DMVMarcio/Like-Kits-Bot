const Like = require('./LikeBOT.js')
const client = new Like()
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(process.env.database, { useNewUrlParser: true }, (err) => {
  if (err) return console.log(`[DATABASE] Erro ao conectar no database!\n${err}`)
  console.log(`[DATABASE] Conectado ao BANCO DE DADOS!`)
})

const User = new Schema({
  _id: {
    type: String
  },
  sync: {
    type: Map,
    default: {on: false, nickname: 'None', code: 'None', id: 'None'}
  },
  muted: {
    type: Map,
    default: {on: false, temp: false, date: 0, time: 0}
  }
})

const Guild = new Schema({
  _id: {
    type: String
  }
})

const Users = mongoose.model('Users', User)
const Guilds = mongoose.model('Guilds', Guild)
exports.Users = Users
exports.Guilds = Guilds