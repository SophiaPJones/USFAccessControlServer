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

export function login(email) {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM Administrators WHERE email = $1::text`,[email])
        .then((error, results) => {
            if(error) {
                console.log(error);
                reject(error);
            } else {
                if(results.rows.length > 0) {
                    resolve(results.rows[0]);
                } else {
                    reject(error);
                }
            }
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

export function saveSession(key, unum, expireTime) {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Sessions (ssid, Unum, expireTime) VALUES($1::text, $2::text, $3::text)`, [key, unum, expireTime])
        .then((error, results) => {
            if(error) {
                console.log(error);
                reject(error);
            } else {
                resolve(results);
            }
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    })
}

export function register(UNum, firstName, lastName, hashedpassword, email) {
    //registers new admin
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUES($1, $2, $3)`,[UNum, firstName, lastName])
        .then((results) => {
            pool.query(`INSERT INTO Administrators(unum, password, email) VALUES($1, $2, $3)`, [UNum, hashedpassword, email])
            .then((res) => {
                resolve();
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

export function createUser(UNum, firstName, lastName){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUE ($1, $2, $3)`, [UNum, firstName, lastName])
        .then((results) => {
            resolve();
        })
        .catch((err) => {
            console.log(`Error in db.createUser(${UNum}, ${firstName}, ${lastName})`);
            console.log(err);
            reject(err);
        })
    })
}

export function createProfessor(UNum, firstName, lastName, title){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUE ($1, $2, $3)`,[UNum, firstName, lastName])
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
export function getAccessCode(scannerID){
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

export function createRoom(RoomNum, Building){
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

export function removeRoom(RoomNum, Building){
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

export function createScanner(hashedAccessCode){
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

export function createScannerAndAssign(hashedAccessCode, roomNum, building, doorNum){
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO Scanners (AccessCode, RoomNum, Building, DoorNum) VALUES ($1, $2, $3, $4)`, [hashedAccessCode, roomNum,building,doorNum])
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

export function assignScanner(scannerID, roomNum, building, doorNum){
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE TABLE Scanners SET RoomNum = $1, Building = $2, DoorNum = $3 WHERE ScannerID = $4` [roomNum,building,doorNum,scannerID])
        .then((res) => {
            resolve(true);
        })
        .catch((err) => {
            console.log(`Error in db.assignScanner(${scannerID, roomNum, building, doorNum}):`);
            console.log(err);
            reject(err);
        });
    });
}

export function unassignScanner(scannerID){
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE TABLE Scanners SET RoomNum = NULL, Building = NULL, DoorNum = NULL WHERE ScannerID = $1` [scannerID])
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

export function removeUser(UNum){
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM Administrators WHERE Unum = $1; DELETE FROM Professors WHERE Unum = $1; DELETE FROM AccessList WHERE UNum = $1; DELETE FROM Users WHERE UNum = $1;', [UNum])
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

export function grantAccess(Unum, RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Scanners WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then(async (res) => {
            await Promise.all(
                res.rows.map(async (scanner) => {
                        pool.query('INSERT INTO AccessList VALUES ($1, $2)', [scanner.scannerID, Unum])
                        .catch((err) => {
                            console.log(`Error in db.grantAccess during insertion with values ${scanner.scannerID}, ${Unum}`)
                            console.log(err);
                            reject(err);
                        })
                    })
            )
            .then(resolve(true));
        })
        .catch((err) => {
            console.log(`Error in db.grantAccess during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

export function revokeAccess(Unum, RoomNum, Building){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Scanners WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then(async (res) => {
            await Promise.all(
                res.rows.map(async (scanner) => {
                        pool.query('DELETE FROM AccessList WHERE ScannerID = $1 AND UNum =  $2', [scanner.scannerID, Unum])
                        .catch((err) => {
                            console.log(`Error in db.revokeAccess during deletion phase with values ${scanner.scannerID}, ${Unum}`)
                            console.log(err);
                            reject(err);
                        })
                    })
            )
            .then(resolve(true));
        })
        .catch((err) => {
            console.log(`Error in db.revokeAccess during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

export function addClassPeriod(RoomNum, Building, StartTime, EndTime){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM Scanners WHERE RoomNum = $1 AND Building = $2', [RoomNum, Building])
        .then(async (res) => {
            await Promise.all(
                res.rows.map(async (scanner) => {
                        pool.query('INSERT INTO Schedules(ScannerID, StartTime, EndTime) VALUES($1, $2, $3)', [scanner.scannerID, StartTime, EndTime])
                        .catch((err) => {
                            console.log(`Error in db.addClassPeriod during insertion phase with values ${scanner.scannerID}, ${StartTime}, ${EndTime}`)
                            console.log(err);
                            reject(err);
                        })
                    })
            )
            .then(resolve(true));
        })
        .catch((err) => {
            console.log(`Error in db.addClassPeriod during selection phase with values ${RoomNum}, ${Building}`);
            console.log(err);
            reject(err);
        })
    })
}

export function removeClassPeriod(ScheduleID){
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

export function checkUserAccess(UNum, ScannerID){
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM AccessList WHERE UNum = $1 AND ScheduleID = $2', [Unum, ScannerID])
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

export function checkSchedule(ScannerID){
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