const path = require("path")
const mongoose = require("mongoose")

const staticShit = {
  routerPath: path.join(__dirname, "router"),
  publicPath: path.join(__dirname, "public"),
  mongoCluster0: "Your Database link",

  weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  customDate: function(){
    let date = new Date()
    date = [ this.weekDays[ date.getDay() ],  date.getDate(), date.getMonth()+1, date.getFullYear(), date.getHours(), date.getMinutes() ]
    date = date.map( e => String(e).length == 1 ? `0${e}` : String(e) )

    return `${date[0]}  ${date[1]}.${date[2]}.${date[3]} ${date[4]}:${date[5]}`
  },

  notes: mongoose.model("notes", {
    title:{
      type: String,
      required: true
    },
    text:{
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    owner:{
      type: String,
      required: true
    },
    tags: {
      type: Array,
      required: false
    }
  }),

  users: mongoose.model("users", {
    login:{
      type: String,
      required: true
    },
    password:{
      type: String,
      required: true
    },
    notes:{
      type: Array,
      required: false
    },
    cookie_id:{
      type: String,
      required: false
    },
  }),

  tags: mongoose.model("tags", {
    name: {
      type: String,
      required: true
    }
  }),
}
module.exports = staticShit
