class Alerter {
  constructor(el) {
    this.DOM = el

    this.DOM.addEventListener("click", function(){
      this.style.opacity = 0
      setTimeout( ()=>{ this.style.display = "none" }, 200 )
    })

    this.alert = function(text){
      this.DOM.innerHTML = text ? text : this.DOM.innerHTML
      if(this.DOM.innerText.length == 0){ return }
      this.DOM.style.display = "block"
      setTimeout( ()=>{ this.DOM.style.opacity = 1 }, 100)
      setTimeout( ()=>{ this.DOM.click() }, 5000 )
    }

  }
}

export default Alerter
