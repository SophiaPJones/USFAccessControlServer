const { Sequelize } = require("sequelize/types");

module.exports = Sequelize.define('Users',{
    UNum:{
        type: Sequelize.NUMERIC(8),
        primaryKey: true
    },
    FirstName:{
        type: Sequelize.VARCHAR(32)
    },
    LastName:{
        type: Sequelize.VARCHAR(32)

    }

});