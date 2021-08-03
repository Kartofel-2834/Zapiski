const express = require("express")
const bodyParser = require('body-parser')
const app = express()
const path = require("path")
const ejs = require("ejs")

const urlencodedParser = bodyParser.urlencoded({ extended: false })
const port = 2000
const routerPath = path.join(__dirname, "router")

//modules
let signIn = require( routerPath + "/signIn.js" )
let fileSender = require( routerPath + "/fileSender.js" )
let noteManager = require( routerPath + "/noteManager.js" )

app.set('views', __dirname + '\\public\\html');
app.set('view engine', 'ejs');

app.use( urlencodedParser )
app.use( signIn )
app.use( fileSender )
app.use( noteManager )

app.get("/error", (req, res)=>{ res.render("error") })

app.listen(port, ()=>{ console.log(`Server working on port ${port}`) })
