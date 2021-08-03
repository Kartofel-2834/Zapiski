export default class Link {
  constructor(li, title, checkBox, id, tag) {
    this.body = li
    this.title = title
    this.checkBox = checkBox
    this.id = id
    this.deleteModeEnabled = this.body.classList.contains("delete_mode")
    this.tag = tag

    this.clickTimeStart = null
    this.clickTimeStamp = 0

    this.body.addEventListener( "mousedown", ()=>{
      this.clickTimeStart = (new Date()).valueOf()
    })

    this.body.addEventListener("mouseup", (e)=>{
      this.clickTimeStamp = (new Date()).valueOf() - this.clickTimeStart
      if( this.deleteModeEnabled ){ this.check() }
    })
  }

  check(){
    if( !this.deleteModeEnabled ){ return }

    this.checkBox.click()
    this.body.classList[ this.checkBox.checked ? "add" : "remove" ]("delete_mode_selected")
  }

  deleteModeON( on ){
    if ( on == this.deleteModeEnabled ){ return }

    if( on ){
      this.body.classList.add("delete_mode")
      this.tag.style.transform = "scale(0)"
      this.checkBox.show()
    }
    else{
      if ( this.checkBox.checked ){ this.check() }
      this.body.classList.remove("delete_mode")
      this.checkBox.hide()
      this.tag.style.transform = "scale(-1, 1)"
    }

    this.deleteModeEnabled = on
  }
}
