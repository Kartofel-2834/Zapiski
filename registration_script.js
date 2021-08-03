import Alerter from '/file?name=scripts\\alerter.js';

let dataSpellCheck = [
  { check: str => str.length > 3, alert: "Your login and password must be longer then 3 symbols!" },
  { check: str => str.length < 20, alert: "Your login and password must be shorter then 20 symbols!" }
]

let submitBtn = document.getElementById("submitBtn")
let form = document.getElementsByTagName("form")[0]
let inputs = document.getElementsByTagName("input")
let alerter = new Alerter( document.getElementById("alerter") )

alerter.DOM.addEventListener("click", ()=>{
  for(let i of inputs){
    if( i.classList.contains("error_value") ){
      i.classList.remove("error_value")
    }
  }
})

submitBtn.onclick = function(){
  let check_1 = true

  for(let i of inputs){
    let check_2 = true

    for(let rule of dataSpellCheck){
      if( !rule.check(i.value) ){
        check_2 = false;
        alerter.alert(rule.alert)
        i.classList.add("error_value")
        break
      }
    }

    if(!check_2){ check_1=false; break }
  }

  if(check_1){ form.submit() }
}
