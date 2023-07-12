const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator");

const auth = require("../../middleware/auth");
const User = require("../../models/User");


const router = express.Router();


router.get("/check", async (req,res) => {
         res.send("server running")
})

router.get("/", auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("server error");
    }
});

router.post("/",[
   
    check("email", "enter a valid email").isEmail(),
    check("password","password is required").exists()

], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});

    }
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).send("invalid credentials")
        }
        
        
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).send("invalid credentials");
        }
        
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(payload,config.get("jwtSecret"),{
            expiresIn: "5 days"
        }, (err,token) => {
            if(err) throw err;
            res.json({ token });
        } );

    } catch (error) {
        console.error(error.msg);
         return res.status(500).send("server error");
        
    }
    
   });
module.exports=router;