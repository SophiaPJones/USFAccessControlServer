const Sequelize = require("sequelize/types");

module.exports = Sequelize.define('Rooms',{
    RoomNum:{
        type: Sequelize.INTEGER,
    },
    Building:{
        type: Sequelize.VARCHAR(16)
        
    },
    RoomID:{
        type: Sequelize.INTEGER,
        primaryKey: true
    }

});
