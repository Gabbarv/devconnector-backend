const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");



const router = express.Router();
const {check, validationResult} = require("express-validator");
const User = require("../../models/User");

router.post("/",[
    check("name", "name is required").not().isEmpty(),
    check("email", "enter a valid email").isEmail(),
    check("password","password should me minimum 6 or more character").isLength({
        min: 6
    })

], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});

    }
    const {name,email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(400).send("user already exist")
        }
        const avatar = gravatar.url({
            s:"200",
            r:"pg",
            d:"mm"
        });
        user = new User({
            name,
            email,
            password,
            avatar
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        await user.save();
        
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(payload,config.get("jwtSecret"),{
            expiresIn: 360000
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