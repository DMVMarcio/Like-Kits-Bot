module.exports = async function (member) {
    let userDB = await this.docDB({type: 1, content: member.user});
    member.addRole('429639084571623426')
    if(userDB.muted.get('on')) { member.addRole(this.config.muteRole, 'Re-entrada de usuário mutado.') }
}