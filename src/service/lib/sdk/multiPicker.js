import Emitter from 'emitter'
import domify from 'domify'
import events from 'events'
import Scrollable from './scrollable'
import tmplFn from './picker.et'
import { range } from '../util'

export default class MultiPicker extends Emitter {
  constructor (opts) {
    super()
    this.opts = opts
    this.root = document.createElement('div')
    document.body.appendChild(this.root)
    this.events = events(this.root, this)
    this.events.bind('click .cancel', 'cancel')
    this.events.bind('click .confirm', 'confirm')
  }
  show () {
    var that = this
    this.root.appendChild(domify('<div class="wx-picker-mask"></div>'))
    const group = this.opts.range
    const el = domify(tmplFn({ group }))
    this.root.appendChild(el)

    const ps = Array.from(this.root.querySelectorAll('.wx-picker-content'))
    const curr = this.getCurrent()
    this.scrollables = ps.map((el, i) => {
      const s = new Scrollable(el, curr[i])
      s.on('end', () => {
        console.log("multiPicker Scrollable end",i,s.currentValue());
        var obj = {column:i,value:Number(s.currentValue())};
        this.emit('columnselect', obj)
        this.checkValue(s, s.currentValue())
      })
      return s
    })
  }
  checkValue (s, value) {
    // TODO validate value
  }
  getCurrent () {
    const str = this.opts.current
    const parts = str.split(',')
    return [Number(parts[0]), Number(parts[1])]
  }
  hide () {
    this.events.unbind()
    this.scrollables.forEach(s => {
      s.unbind()
    })
    document.body.removeChild(this.root)
  }
  cancel (e) {
    e.preventDefault()
    this.hide()
    this.emit('cancel')
  }
  confirm (e) {
    e.preventDefault()
    let vals = this.scrollables.map(s => {
      return s.currentValue()
    })
    this.hide()
    console.log("multiPicker select",vals);
    this.emit('select', [Number(vals[0]),Number(vals[1])])
  }
}
