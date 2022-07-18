const Sequelize = require("sequelize/types");

module.exports = Sequelize.define('Administrators',{
    UNum:{
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Email:{
        type: Sequelize.VARCHAR(128)
        
    }
});
