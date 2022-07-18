var db = require("./database/db");

const crypto = require('crypto');

var config = require('./config');

export function authCheck() {
    return(req, res, next) => {
        if(req.body.key) {
            // Check if the session has expired and exists, return user_id
            db.getSession(crypto.createHmac('sha256', config.encrypt.hashsecret).update(req.body.key).digest('hex').toString(), this.formattedDate(new Date())).then((object) => {
                if(object.exist) {
                    //A valid session exists with the given key.
                    return next();
                } else {
                    return res.status(401).send({error:"Invalid Session", code: 2});
                }
            }).catch(() => {
                return res.status(500).send({error:"Error Session", code: 2});
            })
        } else {
            return res.status(401).send({error:"Invalid Key", code: 2});
        }
    }
}

// YYYY-MM-DD HH:mm:ss
export function formatDate(date) {
    return (date.getFullYear()+"-"+
        (date.getMonth()+1).toString().padStart(2, '0')+"-"+
        (date.getDate()).toString().padStart(2, '0')+" "+
        date.getHours().toString().padStart(2, '0')+":"+
        date.getMinutes().toString().padStart(2, '0')+":"+
        date.getSeconds().toString().padStart(2, '0'));
}