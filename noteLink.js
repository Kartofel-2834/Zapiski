export default class NoteLink {
  constructor(arrayOfLinks) {
    this.link = arrayOfLinks
    this.clickTimeStamp = 0
    this.clickTimeStart = null

    this[Symbol.iterator] = function(){
      return iterator( this.link )
    }
  }

  deleteModeON( bool ) {
    this.link.forEach( l => l.deleteModeON( bool ) )
  }

  checkAll() {
    for( let l of this ){
      if( !l.checkBox.checked ){ l.check() }
    }
  }

  uncheckAll() {
    for( let l of this ){
      if( l.checkBox.checked ){ l.check() }
    }
  }

  filter( test ) {
    let trash = []

    this.link = this.link.filter( (l)=>{
      if( test(l) ){ return true }
      else{ l.body.remove(); trash.push(l.id) }
    })

    return trash
  }

  searchByTitle( title ){
    let tester = new RegExp( title, "gmi" )

    for(let link of this){
      let liClasses = link.body.classList

      if( !tester.test( link.title ) ){
        liClasses.add("hide")

        if( link.checkBox.checked ){ link.check() }
      }
      else if( liClasses.contains("hide") ){
        liClasses.remove("hide")
      }
    }
  }
}


function iterator(arr){
  return {
    iterableArr: arr,
    current: 0,
    next(){
      let ans = { done: false, value: this.iterableArr[ this.current ] }

      if( this.current == this.iterableArr.length ){
        ans = { done: true }
      }

      this.current++
      return ans
    }
  }
}
