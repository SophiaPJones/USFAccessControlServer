const { Sequelize } = require("sequelize/types");

module.exports = Sequelize.define('Scanners',{
    ScannerID:{
        type: Sequelize.VARCHAR(32),
        primaryKey: true
        
    },
    AccessCode:{
        type: Sequelize.VAR(6)
    },
    DoorNum:{
        type:Sequelize.INTEGER
    },
    RoomID:{
        type:Sequelize.INTEGER
    }
});