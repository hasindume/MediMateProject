const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const bcryptjs =  require('bcryptjs');
const uuid = require('uuid');

const db = require('../database/database');
const mailer = require('../mail/mailer');

router.get('/signup', (req, res) => {

    try {

        const emailstatus = req.query.passwordNotMatch;

        res.render('signup',{emailstatus:emailstatus});


    } catch (error) {
        res.status(500).send(`<h1>Server Error</h1><p>${error.message}</p>`);
    }


});

router.post('/signup/doctors', async (req, res) => {

    const { userName, email, password ,confirmPassword, slmcregi,role} = req.body;
    console.log(userName, email, password,confirmPassword,slmcregi,role);

    if(userName === '' || email === '' || password === '' || confirmPassword === '' || slmcregi === ''){
        return res.json({ success: false, message: 'Please Fill All Fields' });
    }
    
    if(password !== confirmPassword){
        return res.json({ success: false, message: 'Confirm Password Not Matched' });
    }

    if(password.length < 5){
        return res.json({ success: false, message: 'Password Should Greater than 5 charactors' });
    }

    const existingUserEmail =  await db.DbConn().collection('doctors').findOne({email:email});
    if(existingUserEmail){

        return res.json({ success: false, message: email+' is already used' });
    }

    const hashedpass = await bcryptjs.hash(password,12);

    let userIdURL = uuid.v4();

    const newUser = {
        name: userName,
        email: email,
        userID : userIdURL,
        password: hashedpass,
        slmcregi:slmcregi,
        role:role,
        profileActive : false
    };

    try {

        const userResult = await db.DbConn().collection('doctors').insertOne(newUser);
        
    } catch (error) {
        console.error("Server Error:", error);
        res.json({ success: false, message: 'Server Error' });
    }


    let userURL = 'hello, this is activation message'

    try {
        await mailer.mainEmail(email, userURL); 
        console.log("Activation Email sent to "+email);
        res.json({ success: true, message: 'Activation Email sent to '+email  })
      } catch (error) {
        console.error("Error sending email:", error);
        res.json({ success: false, message: 'Check Your Email Address' });
      }

});


router.post('/signup/patients', async (req, res) => {

    const { userName, email, password ,confirmPassword, role} = req.body;
    console.log(userName, email, password,confirmPassword,role);

    if(userName === '' || email === '' || password === '' || confirmPassword === ''){
        return res.json({ success: false, message: 'Please Fill All Fields' });
    }
    
    if(password !== confirmPassword){
        return res.json({ success: false, message: 'Confirm Password Not Matched' });
    }

    if(password.length < 5){
        return res.json({ success: false, message: 'Password Should Greater than 5 charactors' });
    }

    const existingUserEmail =  await db.DbConn().collection('patients').findOne({email:email});
    if(existingUserEmail){

        return res.json({ success: false, message: email+' is already used' });
    }

    const hashedpass = await bcryptjs.hash(password,12);

    let userIdURL = uuid.v1();

    const newUser = {
        name: userName,
        email: email,
        userID : userIdURL,
        password: hashedpass,
        role:role,
        profileActive : false
    };

    try {

        const userResult = await db.DbConn().collection('patients').insertOne(newUser);
        
    } catch (error) {
        console.error("Server Error:", error);
        res.json({ success: false, message: 'Server Error' });
    }

    let userURL = 'hello, this is activation message'

    try {
        await mailer.mainEmail(email, userURL); 
        console.log("Activation Email sent to "+email);
        res.json({ success: true, message: 'Activation Email sent to '+email  })
      } catch (error) {
        console.error("Error sending email:", error);
        res.json({ success: false, message: 'Check Your Email Address' });
      }


});

module.exports = router;

