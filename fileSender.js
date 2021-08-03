const express = require("express")
const router = express.Router()
const staticShit = require('../staticShit')

router.get("/file", (req, res)=>{
  res.sendFile( staticShit.publicPath + `\\${req.query.name}` )
})

module.exports = router
