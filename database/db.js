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
        pool.query(`SELECT * FROM Administrators WHERE email = ${email}`)
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
        pool.query(`INSERT INTO Sessions (ssid, Unum, expireTime) VALUES(${key}, ${unum}, ${expireTime})`)
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
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUES(${UNum}, ${firstName}, ${lastName})`)
        .then((results) => {
            pool.query(`INSERT INTO Administrators(unum, password, email) VALUES(${Unum}, ${hashedpassword}, ${email})`)
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
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUE (${UNum}, ${firstName}, ${lastName})`)
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
        pool.query(`INSERT INTO Users(UNum, firstName, lastName) VALUE (${UNum}, ${firstName}, ${lastName})`)
        .then((results) => {
            pool.query(`INSERT INTO Professors (UNum, Title) VALUES (${UNum}, ${title})`)
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
        pool.query(`SELECT * FROM Scanners WHERE ScannerID = ${scannerID}`)
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
        pool.query(`INSERT INTO Rooms (RoomNum, Building) VALUES (${RoomNum} , ${Building})`)
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
        pool.query(`DELETE FROM Rooms WHERE RoomNum = ${RoomNum} AND Building = ${Building})`)
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
        pool.query(`INSERT INTO Scanners (accesscode) VALUES (${hashedAccessCode})`)
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
        pool.query(`INSERT INTO Scanners (AccessCode, RoomNum, Building, DoorNum) VALUES (${hashedAccessCode}, ${roomNum}, ${building}, ${doorNum})`)
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
        pool.query(`UPDATE TABLE Scanners SET RoomNum = ${roomNum}, Building = ${building}, DoorNum = ${doorNum} WHERE ScannerID = ${scannerID}`)
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

