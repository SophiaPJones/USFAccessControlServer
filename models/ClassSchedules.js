const { Sequelize } = require("sequelize/types");

module.exports = Sequelize.define('ClassSchedules',{
    ScannerID:{
        type: Sequelize.VARCHAR(32),
        primaryKey: true
        
    },
    StartTime:{
        type: Sequelize.timestamp()
    }, 
    EndTime:{
        type: Sequelize.timestamp()
    }
});