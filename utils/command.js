module.exports = class command {
    constructor(name, client) {
        this.name = name;
        this.client = client;
        this.aliases = [];
    }
    process({message, args, usuario, servidor}) {
        return this.run({message, args, usuario, servidor});
    }
    run () {}
}