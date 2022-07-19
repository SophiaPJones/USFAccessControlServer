
const express = require ('express');
const router  = express.Router();
const db = require('../database/db');
const util = require('../util');
const config = require('../config');
const { route } = require('express/lib/application');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const crypto = require('crypto');
const { Pool } = require('pg');


router.post("/login", (req, res) => {
  if(req.body.email && req.body.password) {
      var buffer = String(req.body.email).toLowerCase();
      if(buffer) {
          // Get Credentials
          db.login(buffer).then((credentials) => {
              bcrypt.compare(req.body.password, credentials.password).then((pass) => {
                  if(pass) {
                      // Create session
                      // Create ssid
                      var ssid = uuid.v4();
                      // Create expire time (24 hour sessions)
                      var expires = new Date(new Date().getTime()+(1000*60*60*24))
                      // Hash it and Save to db
                      db.saveSession(crypto.createHmac('sha256', config.encrypt.hashsecret).update(ssid).digest('hex').toString(), credentials.unum, util.formatDate(expires))
                          .then(() => {
                          res.status(200).send({key:ssid, "code": 200});
                      }).catch(() => {
                          res.status(500).send({"error":"Couldn't save session in DB", "code": 207});
                      })
                  } else {
                      res.status(401).send({"error":"Invalid password!", "code": 206});
                  }
              })
          }).catch(() => {
              res.status(401).send({"error":"Could not retrieve administrator's credentials in endpoint /login", "code": 205});
          })
      } else {
          res.status(401).send({"error":"toLowerCase buffer for email failed in endpoint /login", "code": 204});
      }
  } else {
      res.status(401).send({"error":"Invalid parameters in call to endpoint /login", "code": 203});
  }
});

router.post('/createRoom', util.authCheck(), function (req, res) {
   if(req.body.RoomNum && req.body.Building){
      var roomNum = typeof req.body.RoomNum === 'string' ? parseInt(req.body.RoomNum) : req.body.RoomNum;
      var building = req.body.Building;
      db.createRoom(roomNum, building)
      .then(
        res.send({"error": "", "code": 200})
      )
      .catch((err) => {
        console.log("Error calling /createRoom endpoint.");
        console.log(err);
        res.send({"error": err, "code": 202});
      })
   }
   else{
     res.status(403).send({"error": "Invalid paramaters submitted to /createRoom endpoint.\nRequires 'RoomNum' and 'Building' parameters.", code: 201});
   }
 });

//RemoveRoom function
router.post('/removeRoom', util.authCheck(), function (req, res){
   if(req.body.RoomNum && req.body.Building)
   {
      var roomNum = typeof req.body.RoomNum === 'string' ? parseInt(req.body.RoomNum) : req.body.RoomNum;
      var building = req.body.Building;
      db.removeRoom(roomNum, building)
      .then(
        res.send({"error": "", "code": 200})
      )
      .catch((err) => {
        console.log("Error calling /removeRoom endpoint.");
        console.log(err);
        res.send({"error": err, "code": 209});
      })
   }else{
      res.status(403).send({"error": "Invalid parameters submitted to /removeRoom endpoint.\nRequires 'RoomNum' and 'Building' parameters.", code: 208})
   }
});

//CreateScanner
router.post('/createScanner', util.authCheck(), function(req,res){
   if(req.body.AccessCode && !req.body.Building && !req.body.RoomNum && !req.body.DoorNum){
      var accessCode = req.body.AccessCode;
      bcrypt.hash(accessCode, config.encrypt.saltrounds)
      .then((hash) => {
          db.createScanner(hash).then(res.send({"error": "", "code": 200}))
          .catch((err) => {
            console.log("Error calling /createScanner endpoint.");
            console.log(err);
            res.send({"error": err, "code": 212})
          })
        }
      )
      .catch((err) => {
        console.log("Error hashing accessCode");
        console.log(err);
        res.send({"error": err, "code": 210})
      })
   }
   else if(req.body.AccessCode && req.body.Building && req.body.RoomNum && req.body.DoorNum){
    var roomNum = typeof req.body.RoomNum === 'string' ? parseInt(req.body.RoomNum) : req.body.RoomNum;
    var building = req.body.Building;
    var doorNum = typeof req.body.DoorNum === 'string' ? parseInt(req.body.DoorNum) : req.body.DoorNum;
    var accessCode = req.body.AccessCode;
    bcrypt.hash(accessCode, config.encrypt.saltrounds)
    .then((hash) => {
        db.createScannerAndAssign(hash,roomNum,building,doorNum).then(res.send({"error": "", "code": 200}))
        .catch((err) => {
          console.log("Error calling /createScanner endpoint.");
          console.log(err);
          res.send({"error": err, "code": 212})
        })
      }
    )
    .catch((err) => {
      console.log("Error hashing accessCode");
      console.log(err);
      res.send({"error": err, "code": 210})
    })
   }
   else{
      res.status(403).send({"error": "Invalid parameters submitted to /createScanner endpoint.\nRequires 'AccessCode'.", code: 211})
   }
   
});
//AssignScanner
router.post('/assignScanner', util.authCheck(), function(req,res){
  if(req.body.ScannerID && req.body.RoomNum && req.body.Building && req.body.DoorNum){
    var scannerID = typeof req.body.ScannerID === 'string' ? parseInt(req.body.ScannerID) : req.body.ScannerID;
    var roomNum = typeof req.body.RoomNum === 'string' ? parseInt(req.body.RoomNum) : req.body.RoomNum;
    var building = req.body.Building;
    var doorNum = typeof req.body.DoorNum === 'string' ? parseInt(req.body.DoorNum) : req.body.DoorNum;
    db.assignScanner(scannerID, roomNum, building, doorNum)
    .then(res.send({"error":"", "code":200}))
    .catch((err) => {
      console.log("Error calling /assignScanner endpoint.");
      console.log(err);
      res.send({"error": err, "code": 214});
    })
  }else{
    res.status(403).send({"error": "Invalid parameters submitted to /assignedScanner endpoint.\nRequires 'ScannerID', 'RoomNum', 'Building', and 'DoorNum' parameters", code: 213});
  }
});
//UnassignScanner
router.post('/unassignScanner', util.authCheck(), function(req,res){
  if(req.body.ScannerID){
    var scannerID = typeof req.body.ScannerID === 'string' ? parseInt(req.body.ScannerID) : req.body.ScannerID;
    db.unassignScanner(scannerID)
    .then(res.send({"error":"", "code":200}))
    .catch((err) => {
      console.log("Error calling /assignScanner endpoint.");
      console.log(err);
      res.send({"error": err, "code": 215});
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /unassignScanner endpoint.\nRequires 'ScannerID' parameters", code: 216});
  }
});

router.post('/createUser', util.authCheck(), function(req, res){
  if(req.body.Role && req.body.UNum && req.body.FirstName && req.body.LastName){
    var unum = typeof req.body.UNum === 'string' ? parseInt(req.body.UNum) : req.body.UNum;
    var role = req.body.Role;
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    if(role === "Professor" && req.body.Title){
      //make new professor
      var title = req.body.Title;
      db.createProfessor(unum, firstName, lastName, title)
      .then(res.send({"error": "", "code": 200}))
      .catch((err) => {
        console.log("Error calling /createUser endpoint with role Professor.");
        console.log(err);
        res.send({"error":err, "code": 220})
      })
    }
    else if(role === "Student"){
      //make a new student
      db.createUser(unum, firstName,lastName)
      .then(res.send({"error":"", "code": 200}))
      .catch((err) => {
        console.log("Error calling /createUser endpoint with role Student.");
        console.log(err);
        res.send({"error":err, "code": 221});
      })
    }
    else if(role === "Administrator" && req.body.password && req.body.email){
      var unhashedPassword = req.body.password;
      var email = req.body.email;
      bcrypt.hash(unhashedPassword, config.encrypt.saltrounds)
      .then(
        (hashedPassword) => {
          console.log("Hashed Password: ");
          console.log(hashedPassword);
          db.register(unum,firstName,lastName,hashedPassword,email)
          .then(res.send({"error":"","code":200}))
          .catch((err) => {
            console.log("Error calling /createUser endpoint with role Administrator.");
            console.log(err);
            res.send({"error": err, "code": 219});
        })
      })
    }
    else{
      res.status(403).send({"error": "Invalid parameters submitted to /createUser endpoint.\nInvalid parameters for given role.", code: 218});
    }
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /createUser endpoint.\nRequires at least 'Role', 'UNum', 'FirstName', and 'LastName' parameters", code: 217});
  }
})

//removeUser from accesslist
router.post('/removeUser', util.authCheck(), (req, res) => {
  if(req.body.UNum){
    var uNum = req.body.UNum;
    db.removeUser(uNum)
    .then(res.send({"error": "", "code": 200}))
    .catch((err) => {
      console.log("Error calling /removeUser endpoint.");
      console.log(err);
      res.send({"error":err, "code": 223})
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /removeUser endpoint.\nRequires 'UNum' parameter", code: 222});
  }
});

//GrantedAccess
router.post('/grantAccess', util.authCheck(), (req, res) => {
  if(req.body.UNum && req.body.RoomNum && req.body.Building){
    var unum = req.body.UNum;
    var roomNum = req.body.RoomNum;
    var building = req.body.Building;
    db.grantAccess(unum, roomNum, building)
    .then(res.send({"error": "", "code": 200}))
    .catch((err) => {
      console.log("Error calling /grantAccess endpoint.");
      console.log(err);
      res.send({"error": err, "code": 225});
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /grantAccess endpoint.\nRequires 'UNum', 'RoomNum', 'Building' parameters", code: 224});
  }
});
//revokeAccess
router.post('/revokeAccess', (req, res) => {
  if(req.body.UNum && req.body.RoomNum && req.body.Building){
    var unum = req.body.UNum;
    var roomNum = req.body.RoomNum;
    var building = req.body.Building;
    db.revokeAccess(unum, roomNum, building)
    .then(res.send({"error": "", "code": 200}))
    .catch((err) => {
      console.log("Error calling /revokeAccess endpoint.");
      console.log(err);
      res.send({"error": err, "code": 227});
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /revokeAccess endpoint.\nRequires 'UNum', 'RoomNum', 'Building' parameters", code: 226});
  }
})
//Add classschedule
router.post('/addClassPeriod', (req, res) => {
  if(req.body.RoomNum && req.body.Building && req.body.StartTime && req.body.EndTime){
    var roomNum = req.body.RoomNum;
    var building = req.body.Building;
    var startTime = req.body.StartTime;
    var endTime = req.body.EndTime;
    db.addClassPeriod(roomNum, building, startTime, endTime)
    .then(res.send({"error": "", "code": 200}))
    .catch((err) => {
      console.log("Error calling /addClassPeriod endpoint.");
      console.log(err);
      res.send({"error": err, "code": 229})
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /addClassPeriod endpoint.\nRequires 'RoomNum', 'Building', 'StartTime', 'EndTime' parameters", code: 228});

  }
});
//Remove class schedule
router.post('/removeClassPeriod', (req, res) => {
  if(req.body.ScheduleID){
    var scheduleID = req.body.ScheduleID
    db.removeClassPeriod(scheduleID)
    .then(res.send({"error": "", "code": 200}))
    .catch((err) => {
      console.log("Error calling /removeClassPeriod endpoint.");
      console.log(err);
      res.send({"error": err, "code": 231})
    })
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /removeClassPeriod endpoint.\nRequires 'ScheduleID' parameter", code: 230});
  }
})

//check user access
router.post('/checkUserAccess', function(req, res){
  if(req.body.UNum && req.body.ScannerID)
  {
    var uNum = req.body.UNum;
    var scannerID = req.body.ScannerID;
    db.checkUserAccess(uNum, scannerID)
    .then((result) => {
      res.send({"valid": result, "error": "", "code": 200});
    })
    .catch((err) => {
      console.log("Error calling /checkUserAcces endpoint.");
      console.log(err);
      res.send({"error": err, "code": 233})
    })
  }
  else {
    res.status(403).send({"error": "Invalid parameters submitted to /checkUserAccess endpoint.\nRequires 'UNum', 'ScannerID' parameters", code: 232});
  }
});

//check scheudule
router.post('/checkSchedule', function(req, res){
  if(req.body.ScannerID){
    var scannerID = req.body.ScannerID;
    db.checkSchedule(scannerID)
    .then((result) => {
      res.send({"valid": result, "error": "", "code": 235})
    })
  }
  else{
    res.stats(403).send({"error": "Invalid parameters submitted to /checkSchedule endpoint.\nRequires 'ScannerID' parameters", code: 234});

  }
});

router.post('/getRooms', util.authCheck(), function(req, res) {
  db.getRooms()
  .then((result)=> {
    res.send({"rooms": result, "error": "", "code": 200});
  })
  .catch((err) => {
    console.log("Error calling /getRooms endpoint.");
    console.log(err);
    res.send({"error": err, "code": 236})
  })
});

router.post('/getUsers', util.authCheck(), function(req, res) {
  db.getUsers()
  .then((result)=> {
    res.send({"users": result, "error": "", "code": 200});
  })
  .catch((err) => {
    console.log("Error calling /getUsers endpoint.");
    console.log(err);
    res.send({"error": err, "code": 237})
  })
});

router.post('/getProfessors', util.authCheck(), function(req, res) {
  db.getProfessors()
  .then((result)=> {
    res.send({"professors": result, "error": "", "code": 200});
  })
  .catch((err) => {
    console.log("Error calling /getProfessors endpoint.");
    console.log(err);
    res.send({"error": err, "code": 237})
  })
});

router.post('/getAdministrators', util.authCheck(), function(req, res) {
  db.getProfessors()
  .then((result)=> {
    res.send({"professors": result, "error": "", "code": 200});
  })
  .catch((err) => {
    console.log("Error calling /getAdministrators endpoint.");
    console.log(err);
    res.send({"error": err, "code": 237})
  })
});

router.post('/getRoomAccessList', util.authCheck(), function(req, res) {
  if(req.body.RoomNum && req.body.Building){
    var roomNum = typeof req.body.RoomNum === 'string' ? parseInt(req.body.RoomNum) : req.body.RoomNum;
    var building = req.body.Building;
    db.getRoomAccessList(roomNum, building)
    .then( (result) => {
        res.send({"accessList": result, "error": "", "code": 200})
      }
    )
    .catch((err) => {
      console.log("Error calling /createRoom endpoint.");
      console.log(err);
      res.send({"error": err, "code": 202});
    })
 }
 else{
   res.status(403).send({"error": "Invalid paramaters submitted to /createRoom endpoint.\nRequires 'RoomNum' and 'Building' parameters.", code: 201});
 }
});

module.exports = router;