const Sequelize = require("sequelize/types");

module.exports = Sequelize.define('AccessLists',{
    ScannerID:{
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    UNum:{
        type: Sequelize.INTEGER
    }
});