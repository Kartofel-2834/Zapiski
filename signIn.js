const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: true })
const mongoose = require('mongoose');
const queryString = require('query-string')
const staticShit = require('../staticShit')
const cookieParser = require('cookie-parser')

let users = null
let notes = null

mongoose.connect( staticShit.mongoCluster0, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then( ()=>{
  console.log("Mongo connected - signIn")
  users = staticShit.users
  notes = staticShit.notes
}).catch( err => console.log(err) )

router.use( cookieParser() );
router.use( urlencodedParser )


router.get("/", async (req, res)=>{
  if( !req.cookies.cookie_id || !req.cookies.login ){
    res.redirect("/signIn"); return
  }

  if( Object.keys(req.query).length > 0 ){ res.redirect("/"); return }

  let user = null

  try { user = await users.findOne({ login: req.cookies.login }) }
  catch (e) { res.redirect("/error"); throw e; return }

  if( !user || user.cookie_id != req.cookies.cookie_id ){ res.redirect("/signIn") }

  let allAccountNotes = await notes.find({ _id: { $in: user.notes } })

  res.render("index", {
    login: req.cookies.login,
    noteLink: allAccountNotes.reverse()
  }); return

})

router.get("/signIn", (req, res)=>{
  res.render("login", { alert: req.query.alert  ? req.query.alert : "" })
})

router.post("/signIn", async (req, res)=>{
  let user = null

  try { user = await users.findOne({ login: req.body.login }) }
  catch (e) { res.redirect("/error"); throw e; return }

  if( !user || user.password != req.body.password ){
    res.render("login", { alert: "Wrong password or login" }); return
  }

  let cookieToken = String( mongoose.Types.ObjectId() )

  try { await users.findOneAndUpdate({ login: req.body.login }, { $set:{ cookie_id: cookieToken } }) }
  catch (e) { res.redirect("/error"); throw e; return }

  res.clearCookie("login", "cookie_id")
  res.cookie("login", req.body.login).cookie("cookie_id", cookieToken )
  res.redirect("/")
})

router.get("/registration", (req, res)=>{
  res.render("registration", { alert: "" })
})

router.post("/registration", async (req, res)=>{
  let user = null

  try { user = await users.find({ login: req.body.login }) }
  catch (e) { res.redirect("/error"); throw e; return }

  if( !user ){
    try { await users.create({ login: req.body.login, password: req.body.password }) }
    catch (e) { res.redirect("/error"); throw e; return }

    res.redirect(`/signIn?${queryString.stringify({ alert: "Account was successfully created" })}`)
    return
  }

  res.render("registration", { alert: "User with this login already exist" })
})

module.exports = router
