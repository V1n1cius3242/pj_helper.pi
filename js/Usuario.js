const mysql = require('mysql')
const bcrypt = require('bcrypt')

class UsuariosBD{

    static connect(){
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'loginbd'
        })
        connection.connect()
        return connection
    }
}

module.exports = UsuariosBD