'use babel';

export default class PatomView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('patom', 'grid')

    this.headers = []
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
  }
  clearElement() {
    // remove old children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild)
    }
  }

  getElement() {
    return this.element
  }

  getTitle() {
    return 'Query Output'
  }

  getDefaultLocation() {
    return 'bottom'
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom']
  }

  getURI() {
    return 'atom://patom-results-view'
  }

  setResults(results) {
    this.clearElement()

    // make header
    this.headers = results.fields.map(f => f.name)
    this.makeRow(this.headers, true)

    // set the number of columns in CSS
    this.element.style.gridTemplateColumns = `repeat(${results.fields.length}, minmax(100px, 1fr))`

    // make actual results
    results.rows.forEach(r => {
      const names = this.headers.map(header => r[header])
      this.makeRow(names)
    });

    return this.element
  }

  setError(error) {
    this.clearElement();
    const elem = document.createElement('h1')
    elem.textContent = error
    this.element.appendChild(elem)

    return this.element
  }

  makeRow(names, isHeader) {
    names.map(name => {
      const cell = document.createElement('span')
      if (name) {
        cell.textContent = name
        if (isHeader) {
          cell.classList.add('header')
        }
      } else {
        cell.textContent = 'NULL'
        cell.classList.add('null')
      }

      return cell
    }).forEach(cell => {
      this.element.appendChild(cell)
    })
  }

}
