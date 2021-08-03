export default class CheckBox{
  constructor(label, checkbox, mark){
    this.border = label
    this.checkBoxInput = checkbox
    this.mark = mark
    this.checked = this.checkBoxInput.checked
  }

  click(){
    this.checkBoxInput.click()

    let comm = this.checkBoxInput.checked ? "add" : "remove"

    this.border.classList[comm]("check_box_label_active")
    this.mark.classList[comm]("check_mark_active")

    this.checked = this.checkBoxInput.checked
  }

  show(){
    this.border.classList.add("check_box_label_works")
  }

  hide(){
    this.border.classList.remove("check_box_label_works")
  }
}
