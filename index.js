import CheckBox from "/file?name=scripts\\checkBox.js"
import Link from "/file?name=scripts\\link.js"
import NoteLink from "/file?name=scripts\\noteLink.js"

let body = document.getElementsByTagName("body")[0]
let noteLinkInner = document.getElementById('noteLink')
let noteBookInner = document.getElementById("noteBookInner")

let noteLinkMenu = document.getElementById("noteLinkMenu")
let noteMakerMenu = document.getElementById("noteMakerMenu")

let checkAllButton = document.getElementById("checkAllButton")
let trashButton = document.getElementById("trashButton")
let backToLinkButton = document.getElementById("backToLinkButton")
let newNoteButton = document.getElementById("newNoteButton")

let searchButton = document.getElementById("searchIcon")
let searchTextInput = document.getElementById("searchInput")

let saveButton = document.getElementById("saveButton")
let backToLinkFromNote = document.getElementById("backToLinkFromNote")
let noteTitleInput = document.getElementById("noteTitleInput")
let noteBook = document.getElementById("noteBook")
let currentNoteId = document.getElementById("currentNoteId")

let noteTagsEditWindowInner = document.getElementById('noteTagsEditWindowInner')
let searchTagInput = document.getElementById("searchTagInput")
let addTagChoiceInner = document.getElementById("addTagChoiceInner")
let tagLinkInner = document.getElementById('tagLinkInner')
let tagNoteId = document.getElementById('tagNoteId')
let tagsCheckBoxes = null

let noteLink = new NoteLink( getArrayOfLinks() )

const postRequestOptions = (body)=>{
  return {
    headers:{ 'Content-Type': 'application/json;charset=utf-8' },
    method: "POST",
    body: JSON.stringify(body)
  }
}

for( let link of noteLink ){

  link.body.addEventListener( "mouseup", async function(e){
    for( let el of e.path ){
      if( el.id && el.id == "tagButton" ){ return }
    }

    if( link.deleteModeEnabled ){ return }
    if( link.clickTimeStamp > 1500 ){ pageDeleteModeOn(); return }

    let res = await fetch("/getNoteById", postRequestOptions({ id: link.id }) )
    res = await res.json()
    if( !res._id ){ return }

    currentNoteId.value = link.id
    noteTitleInput.value = res.title
    noteBook.value = res.text

    switchLinkOnNoteAndBack( true )
  })

  link.tag.addEventListener("click", async function(){
    let res = await fetch("/getNoteTags", postRequestOptions({ id: link.id }) )
    res = await res.json()
    tagNoteId.value = link.id

    if( !res.length || res.length == 0 ){ addTagChoiceInner.classList.remove("hide") }

    for( let tag of res ){
      tagLinkInner.insertAdjacentHTML( "beforeend", `
        <div class="tag_choice" name="tagChoice">
          <div>${ tag.name }</div>

          <div class="check_box_label grid_nakladka_element" id="tagChbLabel"  name="checkBoxLabelTag">
            <div class="check_mark check_mark_hide" id="tagChbMark" name="checkMarkTag"></div>
            <input type="checkbox" class="hide" name="checkForDeleteTag">
          </div>
        </div>
      `)
    }

    tagsCheckBoxes = Array.from( document.getElementsByName('checkBoxLabelTag') )
    let checkMarkTag = Array.from( document.getElementsByName('checkMarkTag') )
    let checkForDeleteTag = Array.from( document.getElementsByName('checkForDeleteTag') )
    let tagChoices = Array.from( document.getElementsByName("tagChoice") )

    tagsCheckBoxes = tagsCheckBoxes.map( (e, i)=>{
      return new CheckBox( e, checkForDeleteTag[i], checkMarkTag[i] )
    })

    tagsCheckBoxes.forEach( ( chb )=>{ chb.show(); chb.click() })

    tagChoices.forEach( ( tch, i ) => {
      tch.onclick = function(){
        tagsCheckBoxes[i].click()
      }
    })


    noteTagsEditWindowInner.classList.remove("hide")
    promiseTimeout( ()=>{
      noteTagsEditWindowInner.classList.remove("hide_opacity")
    }, 100)
  })

}

newNoteButton.onclick = function(){
  noteTitleInput.value = ""
  noteBook.value = ""
  currentNoteId.value = ""
  switchLinkOnNoteAndBack( true )
}

saveButton.onclick = async function(){
  if( noteTitleInput.value.length == 0 ){
    noteTitleInput.classList.add("title_error"); return
  }

  let newNoteData = {
    title: noteTitleInput.value,
    text: noteBook.value,
    noteId: currentNoteId.value.length > 0 ? currentNoteId.value : null
  }

  let res = await fetch("/saveNote", postRequestOptions( newNoteData) )
  let resBody = await res.json()

  currentNoteId.value = resBody.noteId ? resBody.noteId : currentNoteId.value

  if( !res.ok ){ alert("Something went wrong. Note not saved") }
}

searchButton.onclick = ()=>{ noteLink.searchByTitle( searchTextInput.value ) }

searchTextInput.onkeyup = function(e){
  if( this.value.length == 0 || e.keyCode == 13 ){
    searchButton.click()
  }
}

searchTagInput.onkeyup = function(e){
  addTagChoiceInner.innerHTML = `Создать тег "${ this.value }"`
}

addTagChoiceInner.onclick = async function(){
  let tagName = searchTagInput.value

  if( tagName.length == 0 ){ return }

  let res = await fetch("/createTag", postRequestOptions({ name: tagName, noteId: tagNoteId.value }) )
  res = await res.json()

  this.classList.add("hide")
}

checkAllButton.onclick = function(){
  let active = this.classList.contains("check_all_btn_active")

  this.classList[ active ? "remove" : "add" ]("check_all_btn_active")
  noteLink[ active ? "uncheckAll" : "checkAll" ]()
}

trashButton.onclick = async function() {
  let active = this.classList.contains("trash_button_active")

  if( active ){
    let trash = noteLink.filter( l => !l.checkBox.checked )
    await fetch("/deleteNotes", postRequestOptions({ links: trash }) )
    return
  }

  pageDeleteModeOn()
}


backToLinkFromNote.onclick = async function(){
  switchLinkOnNoteAndBack( false )
}

backToLinkButton.onclick = async function(){
  await changeMenuButtons( newNoteButton, this )
  trashButton.classList.remove("trash_button_active")
  checkAllButton.classList.add("hide_opacity")

  noteLink.deleteModeON( false )

  await promiseTimeout( ()=>{ checkAllButton.classList.add("hide") }, 250 )
}


function getArrayOfLinks(){
  let noteLink = Array.from( document.getElementsByTagName("li") )
  let getByName =  name => Array.from( document.getElementsByName( name ) )

  let checkBoxLabels = getByName("checkBoxLabel")
  let checkMarks = getByName("checkMark")
  let checkBoxInputs = getByName("checkForDelete")
  let noteIds = getByName("noteId").map( el => el.value )
  let titles = getByName("noteTitle").map( el => el.innerText )
  let tagButtons = getByName("tagButton")

  noteLink = noteLink.map( (e, i)=>{
    let chb = new CheckBox( checkBoxLabels[i], checkBoxInputs[i], checkMarks[i] )
    return new Link(e, titles[i], chb, noteIds[i], tagButtons[i] )
  })

  return noteLink
}

function promiseTimeout( func, timeout ){
  return new Promise( (resolve, reject) => {
    setTimeout( ()=>{ func(); resolve() }, timeout);
  })
}

async function changeMenuButtons( show, hide ){
  hide.classList.add("hide_fiction")

  await promiseTimeout( ()=>{
    hide.classList.add("hide")
    show.classList.remove("hide")
  }, 200 )

  setTimeout( ()=>{
    show.classList.remove("hide_fiction")
  }, 100)
}


async function pageDeleteModeOn(){
  await changeMenuButtons( backToLinkButton, newNoteButton )

  trashButton.classList.add("trash_button_active")
  checkAllButton.classList.remove("hide")
  noteLink.deleteModeON( true )

  await promiseTimeout( ()=>{ checkAllButton.classList.remove("hide_opacity") }, 150 )
}

async function switchLinkOnNoteAndBack( forward ){
  let show = { page: noteBookInner.classList, menu: noteMakerMenu.classList }

  let hide = { page: noteLinkInner.classList, menu: noteLinkMenu.classList }

  if( !forward ){
    var buff = show;
    show = hide; hide = buff
  }

  hide.page.add("hide_opacity")
  hide.menu.add( forward ? "hide_menu_vertical" : "hide_menu" )


  await promiseTimeout( ()=>{
    hide.page.add("hide")
    show.page.remove("hide")
    body.classList[ forward ? "add" : "remove" ]("body_overflow")
  }, 250 )

  await promiseTimeout( ()=>{ show.page.remove("hide_opacity") }, 100 )
  show.menu.remove( forward ? "hide_menu" : "hide_menu_vertical" )
}
