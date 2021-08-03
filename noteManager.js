const express = require("express")
const router = express.Router()
const bodyParser = require("body-parser")
const urlencodedParser = bodyParser.urlencoded({ extended: true })
const mongoose = require('mongoose');
const staticShit = require('../staticShit')
const cookieParser = require('cookie-parser')

let users = null
let notes = null
let tags = null

mongoose.connect( staticShit.mongoCluster0, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then( ()=>{
  console.log("Mongo connected - noteManager")
  users = staticShit.users
  notes = staticShit.notes
  tags = staticShit.tags
}).catch( err => console.log(err) )

router.use( bodyParser.json() )
router.use( cookieParser() );
router.use( urlencodedParser )

router.post("/saveNote", async (req, res)=>{
  let title = req.body.title
  let text = req.body.text
  let noteId = req.body.noteId
  
  title = title && title.length > 0 ? title : "Без названия"
  text = text ? text : ''

  let newNote = null
  let user = null

  try { user = await users.findOne({ cookie_id: req.cookies.cookie_id }) }
  catch (e) { res.redirect("/error"); throw e; return }
  if( !user ){ res.redirect("/signIn"); return }

  if( noteId ){
    noteId = mongoose.Types.ObjectId( noteId )

    try {
      await notes.findOneAndUpdate( { _id: noteId }, { $set:{
        title: title,
        text: text,
        date: staticShit.customDate(),
      } } )
    } catch (e) { res.redirect("/error"); throw e; return }

    res.json({}); return
  }

  try {
    await notes.create({
      title: title,
      text: text,
      date: staticShit.customDate(),
      owner: String( user._id )
    }).then( q => newNote = q )

    if( !newNote ){ res.json({}); return }

    if( !user.notes ){ user.notes = [ newNote._id ] }
    else{ user.notes.push( newNote._id ) }

    await users.findOneAndUpdate({ cookie_id: req.cookies.cookie_id }, { $set:{ notes: user.notes } })

  } catch (e) { res.redirect("/error"); throw e; return }

  res.json( { noteId: String( newNote._id ) } )
})

router.post("/getNoteById", async (req, res)=>{
  let response = null
  try { response = await notes.findOne( { _id: req.body.id }) }
  catch (e) { response = {}; throw e; }

  res.json( response )
})

router.post("/deleteNotes", async (req, res)=>{
  if( req.body.links.length == 0 ){ console.log("Отсоси");res.sendStatus(200); return }

  try { user = await users.findOne({ cookie_id: req.cookies.cookie_id }) }
  catch (e) { res.redirect("/error"); throw e; return }
  if( !user ){ res.redirect("/signIn"); return }

  let trashNotes = req.body.links
  user.notes = user.notes.map( n => String(n) )
  user.notes = user.notes.filter( n => trashNotes.indexOf(n) == -1 )

  try {
    await notes.deleteMany({ _id: { $in: trashNotes } })

    await users.findOneAndUpdate(
      { cookie_id: req.cookies.cookie_id },
      { $set: { notes: user.notes } }
    )
  }
  catch (e) { res.redirect("/error"); throw e; return }

  res.sendStatus(200)
})

router.post("/createTag", async (req, res)=>{
  let tagName = req.body.name
  let createdTag = null

  if( !tagName || tagName.length == 0 ){ res.sendStatus(404); return }

  try {
    createdTag = await tags.create( { name: tagName } )
    let note = await notes.findOne( { _id: req.body.noteId } )

    if( note.tags ){ note.tags.push( createdTag._id ) }
    else{ note.tags = [ createdTag._id ] }

    await notes.findOneAndUpdate( { _id: note._id }, { $set: { tags: note.tags } } )
  }
  catch (e) { res.redirect("/error"); throw e; return }

  res.json( createdTag )
})

router.post("/getNoteTags", async (req, res)=>{
  let response = null
  try { response = await notes.findOne( { _id: req.body.id }) }
  catch (e) { response = {}; throw e; }

  response = await tags.find( { _id: { $in: response.tags } } )

  res.json( response )
})

module.exports = router
