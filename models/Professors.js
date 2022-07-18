const Sequelize = require("sequelize/types");

module.exports = Sequelize.define('Professors',{
    UNum:{
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Title:{
        type: Sequelize.VARCHAR(16)
        
    },
    FirstName:{
        type: Sequelize.VARCHAR(32)
    },
    LastName:{
        type: Sequelize.VARCHAR(32)
    }
});
