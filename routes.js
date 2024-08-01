const express = require("express");
const router = express.Router();


router.get('/user' , async (req,res)=>{
  const session = req.session
  if (session.loggedIn){
    res.send("hiiiii")
  }else{
    res.send("login to view this page")
  }
})

module.exports = router;