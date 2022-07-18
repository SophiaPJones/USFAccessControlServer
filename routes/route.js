
const express = require ('express');
const router  = express.Router();
const Rooms = require('../models/Rooms');
const Scanners = require('../models/Scanners');
const Users = require('../models/Users');
const Administrators = require('../models/Administrators');
const Professors = require('../models/Professors');
const AccessLists = require('../models/AccessLists');
const ClassSchedules = require('../models/ClassSchedules');
const db = require('../database/db');
const util = require('../util');
const config = require('../config');
const { route } = require('express/lib/application');
const bcrypt = require('bcrypt');

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
                      db.savesession(crypto.createHmac('sha256', config.encrypt.hashsecret).update(ssid).digest('hex').toString(), credentials.Unum, util.formatDate(expires))
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
   else if(req.body.AccessCode && !req.body.Building && !req.body.RoomNum && !req.body.DoorNum){
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
    db.assignScanner(scannerID, "NULL", "NULL", "NULL")
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

router.createUser('/createUser', util.authCheck(), function(req, res){
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
      bcrypt.hash(unhashedPassword, config.encrypt.saltrounds, (hashedPassword) => {
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
    
  }
  else{
    res.status(403).send({"error": "Invalid parameters submitted to /removeUser endpoint.\nRequires 'UNum' parameter", code: 222});
  }
});
//GrantedAccess
router.post('/grantaccess/:scannerid/:unum', async (req, res) => {
  const unum = req.params.unum;
  const scannerid  = req.params.scannerid;
  const { err, reqs } = await AccessLists.getvalue(unum,  scannerid);      
  if(CreateRoom.RoomID = CreateScanner.RoomID) {
    res.send(reqs)
  } else {
    console.error(err);
    res.send(err);
  }
});
//revokeAccess
router.delete('/revoke/:scannerid', (req, res) => {
  const revoke = getUserIndex(req.params.scannerid)
  if (scannerid=== -1) return res.status(404).json({})
  AccessLists.splice(revoke, 1)
  res.json(AccessLists)
})
//Add classschedule
router.post('classschedule/:scannerid/:starttime/endtime', (req, res) => {
  const Scannerid = getScanner(req.params.scannerid);
  const StartTime = getStartTime(req.params.starttime);
  const EndTime = getEndTime(req.params.endtime);
  const { err, reqs } = await ClassSchedules.getvalue(Scannerid,StartTime,EndTime);      
  if(Rooms.RoomID = Scanners.RoomID) {
    res.send(reqs)
  } else {
    console.error(err);
    res.send(err);
  }
});
//Remove class schedule
router.post('removeclass/:timeslotid', (req, res) => {
  const removeclass  = getRemoveClass(req.params.timeslotid);
  if(!removeclass) return;
  ClassSchedules.RemovClass(req.params.timeslotid, () => {
    res.status(200).send();  
  })
})
//check user access
router.post('/checkuser/:scannerid/:unum', function(req, res){
  if(req.params.scannerid ==! AccessLists.ScannerID && req.params.unum ==! AccessLists.UNum)
    return res.send("Not in the access list")
  else {
    return res.send("Matching on the access list")
  }
});
//check scheudule
router.post('/checkschedule/:scannerid/currenttime', function(req, res){
  const scannerid = req.params.scannerid;
  const today = new Date;
  if(AccessLists.StartTime <= today && AccessLists.EndTime >= today){
    return res.send("valid value")
  }else{
    return res.send("Invalid value")
  }
});
module.exports = router;
