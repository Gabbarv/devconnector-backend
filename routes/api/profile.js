const express = require("express");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.get("/me",auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate("user",["name","avatar"]);

        if(!profile){
            return res.status(400).send("There is no profile for this user");
        }
        res.json(profile)
    } catch (error) {
        console.error(error);
        res.status(500).send("msg: server error");
        
    }
});

router.post("/",auth,
[check('status', 'Status is required').notEmpty(),
check('skills', 'Skills is required').notEmpty()],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // destructure the request
  const {
      company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  } = req.body;

  const profileFields={};
  profileFields.user= req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  if(skills) {profileFields.skills = 
    skills.split(",").map(skill => skill.trim());}

   profileFields.social={};

   if(youtube) profileFields.social.youtube=youtube;
   if(instagram) profileFields.social.instagram=instagram;
   if(facebook) profileFields.social.facebook=facebook;
   if(twitter) profileFields.social.twitter=twitter;
   if(linkedin) profileFields.social.linkedin=linkedin;

   try {
       let profile = await Profile.findOne({user: req.user.id});
       if(profile){
           profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields},{new: true});
           res.json(profile);
       }else{
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
       }
      

       
       
   } catch (error) {
       console.error(error);
       res.status(500).send("server error");
       
   }


 
});
router.get("/", async (req,res) => {
    try {
        const profiles = await Profile.find().populate("user",["name", "avatar"]);
        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send("server error");
        
    }
});

router.get("/user/:user_id", async (req,res) => {
    try {
        const profile = await Profile.find({user: req.params.user_id}).populate("user",["name", "avatar"]);
        if(!profile){
            return res.status(400).send({msg: "there is no profile for this user"});
        }
        res.json(profile);
    } catch (error) {
        console.error(error);
        if(error.kind == "ObjectId"){
            return res.status(400).send({msg: "profile not found"});
        }
        res.status(500).send("server error");
        
    }
});
router.delete("/",auth,async (req,res) => {
    try {
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        res.json("user deleted");

        
    } catch (error) {
        
        console.error(error);
        res.status(400).send("server error");
    }
});
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

  router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
  
      foundProfile.experience = foundProfile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  router.put(
    '/education',
    auth,
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(req.body);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/profile/education/:edu_id
  // @desc     Delete education from profile
  // @access   Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      foundProfile.education = foundProfile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
  // @route    GET api/profile/github/:username
  // @desc     Get user repos from Github
  // @access   Public
  router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });

module.exports=router;