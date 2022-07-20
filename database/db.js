const { response } = require("express");
//const fetch = (...args) => import('node-fetch').then(({default:fetch}) => fetch(...args));
const { Client } = require('pg');
const { Pool } = require('postgres-pool');

const pool = new Pool({
    user: 'sophia',
    password: "Tricky23!",
    host: '198.199.78.227',
    database : 'access',
    port: "5432"
});

// console.log("making query");
// pool.query('SELECT * FROM Rooms').then((res) => {
//     console.log("Query succeeded");
//     console.log(res);
//     pool.end();
//     console.log("Query finished.");
// }).catch((err) => {
//     console.log(err);
// });

 function login(email) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM Administrators WHERE email = $1::text`,[email])
        .then((results) => {
            if(results.rows.length > 0) {
                resolve(results.rows[0]);
            } else {
                reject(error);
            }
            
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

 function saveSession(key, unum, expireTime) {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Sessions (ssid, unum, expireTime) VALUES($1, $2, $3)`, [key, unum, expireTime])
        .then((results) => {
            resolve(results);
            
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

function getSession(hashedkey, date) {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM Sessions WHERE ssid = $1 AND expiretime > $2",[hashedkey, date]) 
        .then((results) => {
            if(results.rowCount > 0) {
                if(results.rows[0]) {
                    resolve({exist:true, unum: results.rows[0].unum});
                } else {
                    resolve({exist:false, unum:"none"});
                }
            } else {
                resolve({exist:false, user_id:"none"});
            }
        })
        .catch((error) => {
            console.log(error);
            reject();
        })
    })
}
 function register(UNum, firstName, lastName, hashedpassword, email) {
    //registers new admin
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUES($1, $2, $3)`,[UNum, firstName, lastName])
        .then((results) => {
            pool.query(`INSERT INTO Administrators(unum, password, email) VALUES($1, $2, $3)`, [UNum, hashedpassword, email])
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.log(err);
                reject(error);
            })
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

 function createUser(UNum, firstName, lastName){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUES ($1, $2, $3)`, [UNum, firstName, lastName])
        .then((results) => {
            resolve(results);
        })
        .catch((err) => {
            console.log(`Error in db.createUser(${UNum}, ${firstName}, ${lastName})`);
            console.log(err);
            reject(err);
        })
    })
}

 function createProfessor(UNum, firstName, lastName, title){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUES ($1, $2, $3)`,[UNum, firstName, lastName])
        .then((results) => {
            pool.query(`INSERT INTO Professors (UNum, Title) VALUES ($1, $2)`, [UNum, title])
            .then(resolve())
            .catch((errr) => {
                console.log(`Error in db.createProfessor(${UNum}, ${firstName}, ${lastName}, ${title})`);
                console.log(err);
                reject(err);
            })
        })
        .catch((err) => {
            console.log(`Error in db.createProfessor(${UNum}, ${firstName}, ${lastName}, ${title})`);
            console.log(err);
            reject(err);
        })
    })
}
 function getAccessCode(scannerID){
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM Scanners WHERE ScannerID = $1`, [scannerID])
        .then((res) => {
            resolve(res.rows[0].accesscode);
        })
        .catch((err) => {
            console.log(`Error in db.getAccessCode(${scannerID}):`);
            console.log(err);
            reject(err);
        })
    })
}

 function createRoom(RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Rooms (RoomNum, Building) VALUES ($1 , $2)`,[RoomNum, Building])
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.createRoom(${RoomNum}, ${Building}):`);
            console.log(err);
            reject(err);
        })
    });
}

 function removeRoom(RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM Rooms WHERE RoomNum = $1 AND Building = $2`, [RoomNum, Building])
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.removeRoom(${RoomNum}, ${Building}):`);
            console.log(err);
            reject(err);
        })
    });
}

 function createScanner(hashedAccessCode){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Scanners (accesscode) VALUES ($1)`, [hashedAccessCode])
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.createScanner(${hashedAccessCode}):`);
            console.log(err);
            reject(err);
        })
    });
}

 function createScannerAndAssign(hashedAccessCode, roomNum, building, doorNum){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms WHERE RoomNum = $1 AND Building = $2', [roomNum, building])
        .then((results) => {
            pool.query(`INSERT INTO Scanners (AccessCode, DoorNum, roomID) VALUES ($1, $2, $3)`, [hashedAccessCode, doorNum, results.rows[0]["roomid"]])
            .then((res) => {
                resolve(true);
            })
            .catch((err) => {
                console.log(`Error in db.createScanner(${hashedAccessCode}):`);
                console.log(err);
                reject(err);
            })
        })
        .catch((err) => {
            console.log(`Error in db.createScanner(${hashedAccessCode}, ${roomNum}, ${building}, ${doorNum})`);
            console.log(err);
            reject(err);
        })

    });
}

 function assignScanner(scannerID, roomNum, building, doorNum){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms WHERE RoomNum = $1 AND Building = $2', [roomNum, building])
        .then((results) => {
            pool.query(`UPDATE Scanners SET RoomID = $1, DoorNum = $2 WHERE ScannerID = $3`, [results.rows[0]["roomid"],doorNum,scannerID])
            .then((res) => {
                resolve(true);
            })
            .catch((err) => {
                console.log(`Error in db.assignScanner(${scannerID, roomNum, building, doorNum}):`);
                console.log(err);
                reject(err);
            });
        })
        .catch((err) => {
                console.log(`Error in db.assignScanner(${scannerID, roomNum, building, doorNum}):`);
                console.log(err);
                reject(err);
        })
        
    });
}

 function unassignScanner(scannerID){
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE Scanners SET RoomID = NULL, DoorNum = NULL WHERE ScannerID = $1`, [scannerID])
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.unassignScanner(${scannerID}):`);
            console.log(err);
            reject(err);
        });
    });
}

 function removeUser(UNum){
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM Administrators WHERE Unum = $1', [UNum])
        .then(pool.query('DELETE FROM Professors WHERE Unum = $1', [UNum]))
        .then(pool.query('DELETE FROM AccessList WHERE UNum = $1', [UNum]))
        .then(pool.query('DELETE FROM Users WHERE UNum = $1', [UNum]))
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.removeUser(${UNum}):`);
            console.log(err);
            reject(err);
        });
    });
}

 function grantAccess(Unum, RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then((res) => {
            if(res.rowCount > 0){
                var roomID = res.rows[0]['roomid'];
                pool.query('SELECT * FROM Scanners WHERE RoomID = $1', [roomID])
                .then(async (res) => {
                    await Promise.all(
                        res.rows.map(async (scanner) => {
                                pool.query('INSERT INTO AccessList VALUES ($1, $2)', [scanner["scannerid"], Unum])
                                .catch((err) => {
                                    console.log(`Error in db.grantAccess during insertion with values ${scanner.scannerID}, ${Unum}`)
                                    console.log(err);
                                    reject(err);
                                })
                            })
                    )
                    .then(resolve(true));
                })
            }
        })
        .catch((err) => {
            console.log(`Error in db.grantAccess during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

 function revokeAccess(Unum, RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then((res) => {
            if(!res.rows[0]) reject();
            pool.query('SELECT * FROM Scanners WHERE RoomID = $1', [res.rows[0]["roomid"]])
            .then(async (res) => {
                await Promise.all(
                    res.rows.map(async (scanner) => {
                            pool.query('DELETE FROM AccessList WHERE ScannerID = $1 AND UNum =  $2', [scanner["scannerid"], Unum])
                            .catch((err) => {
                                console.log(`Error in db.revokeAccess during deletion phase with values ${scanner.scannerID}, ${Unum}`)
                                console.log(err);
                                reject(err);
                            })
                        })
                )
                .then(resolve(true));
            })
        }) 
        .catch((err) => {
            console.log(`Error in db.revokeAccess during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

 function addClassPeriod(RoomNum, Building, StartTime, EndTime){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then((res) => {
            pool.query('SELECT * FROM Scanners WHERE RoomID = $1', [res.rows[0]["roomid"]])
            .then(async (res) => {
                await Promise.all(
                    res.rows.map(async (scanner) => {
                            pool.query('INSERT INTO Schedules(ScannerID, StartTime, EndTime) VALUES($1, $2, $3)', [scanner["scannerid"], StartTime, EndTime])
                            .catch((err) => {
                                console.log(`Error in db.addClassPeriod during insertion phase with values ${scanner["scannerid"]}, ${StartTime}, ${EndTime}`)
                                console.log(err);
                                reject(err);
                            })
                        })
                )
                .then(resolve(true));
            })
        })
        .catch((err) => {
            console.log(`Error in db.addClassPeriod during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

 function removeClassPeriod(ScheduleID){
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM Schedules WHERE ScheduleID = $1', [ScheduleID])
        .then(() => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.removeClassPeriod with values ${ScheduleID}`);
            console.log(err);
            reject(err);
        })
    })
}
 
function checkUserAccess(UNum, ScannerID){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM AccessList WHERE UNum = $1 AND ScannerID = $2', [UNum, ScannerID])
        .then((res) => {
            if(res.rowCount > 0){
                //log it
                //getScannerRoomInfo
                pool.query('SELECT * FROM Scanners WHERE ScannerID = $1', [ScannerID])
                .then((result) => {
                    pool.query('INSERT INTO LOG (unum, scannerid, roomid, eventtime) VALUES ($1, $2, $3, NOW())', [UNum, ScannerID, result.rows[0]['roomid']])
                    .then(                
                        resolve(true)
                    )
                })
            }
            else resolve(false);
        })
        .catch((err) => {
            console.log(`Error in db.checkUserAccess during selection phase with values ${UNum}, ${ScannerID}`);
            console.log(err);
            reject(err);        
        })
    })
}

function checkSchedule(ScannerID){
    return new Promise((resolve, reject) => {

        pool.query('SELECT * FROM Schedules WHERE current_timestamp >= StartTime AND current_timestamp <= EndTime AND ScannerID = $1', [ScannerID])
        .then((res) => {
            if(res.rowCount >= 1){
                resolve(true);
            }
            else resolve(false);
        })
        .catch((err) => {
            console.log(`Error in db.checkUserAccess during selection phase with values ${Unum}, ${ScannerID}`);
            console.log(err);
            reject(err);        
        })
    })
}

function getRooms(){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Rooms')
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log("Error in db.getRooms().");
            console.log(err);
            reject(err);
        })
    })
}

function getUsers(){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Users')
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log("Error in db.getUsers().");
            console.log(err);
            reject(err);
        })
    })
}

function getProfessors(){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Professors')
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log("Error in db.getProfessors().");
            console.log(err);
            reject(err);
        })
    })
}

function getAdministrators(){
    return new Promise((resolve, reject) => {
        pool.query('SELECT (UNum, email) FROM Administrators')
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log("Error in db.getAdministrators().");
            console.log(err);
            reject(err);
        })
    })
}

function getScanners(){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Scanners')
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log("Error in db.getScanners().");
            console.log(err);
            reject(err);
        })
    })
}

function getRoomAccessList(RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query('SELECT AccessList.ScannerID, AccessList.UNum FROM Scanners JOIN Rooms ON Scanners.RoomID = Rooms.RoomID JOIN AccessList ON Scanners.ScannerID = AccessList.ScannerID WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then((res)=> {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log(`Error in db.getRoomAccessList(${RoomNum}, ${Building}).`);
            console.log(err);
            reject(err);
        })
    })
}

function getLogForRoom(RoomNum, Building) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT Log.eventid, Log.unum, Log.ScannerID, Log.eventtime FROM Log JOIN Rooms ON Log.RoomID = Rooms.RoomID WHERE Rooms.RoomNum = $1 AND Rooms.Building = $2', [RoomNum, Building])
        .then((res) => {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log(`Error in db.getLogForRoom(${RoomNum}, ${Building}).`);
            console.log(err);
            reject(err);
        })
    })
}

function getScannersAssignedToRoom(RoomNum, Building) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT Scanners.ScannerID FROM Scanners JOIN Rooms ON Scanners.RoomID = Rooms.RoomID WHERE Rooms.RoomNum = $1 AND Rooms.Building = $2', [RoomNum, Building])
        .then((res) => {
            resolve(res.rows);
        })
        .catch((err) => {
            console.log(`Error in db.getScannersAssignedToRoom(${RoomNum}, ${Building}).`);
            console.log(err);
            reject(err);
        })
    })
}

module.exports = {
    login, saveSession,
    register, createUser,
    createProfessor, getAccessCode,
    createRoom, removeRoom,
    createScanner, createScannerAndAssign,
    assignScanner, unassignScanner,
    removeUser, grantAccess,
    revokeAccess, addClassPeriod,
    removeClassPeriod, checkUserAccess,
    checkSchedule, getSession,
    getRooms, getUsers,
    getProfessors, getAdministrators,
    getScanners, getRoomAccessList,
    getLogForRoom, getScannersAssignedToRoom

}