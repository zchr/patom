'use babel';

export default class PatomView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')

    this.headers = []
  }

  init() {
    this.clearElement()

    // div for summary statistics on query
    this.overview = document.createElement('div')
    this.overview.classList.add('patom', 'flex')

    // div for actual results
    this.results = document.createElement('div')
    this.results.classList.add('patom', 'grid')

    this.element.appendChild(this.overview)
    this.element.appendChild(this.results)
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
    this.init()
    // make results overview
    this.overview.innerHTML = `
      <div>
        <span class="icon icon-watch"></span>
        <span>${this.formatDuration(results.duration)}</span>
      </div>
      <div>
        <span class="icon icon-three-bars"></span>
        <span>${results.rowCount} ${results.rowCount == 1 ? 'row' : 'rows'} affected</span>
      </div>
    `

    // make header
    this.headers = results.fields.map(f => f.name)
    this.makeRow(this.headers, true)

    // set the number of columns in CSS
    this.results.style.gridTemplateColumns = `repeat(${results.fields.length}, minmax(100px, 1fr))`

    // make actual results
    results.rows.forEach(r => {
      const names = this.headers.map(header => r[header])
      this.makeRow(names)
    });

    return this.element
  }

  setError(error) {
    this.init();

    // make results overview
    this.overview.innerHTML = `
      <div>
        <span class="icon icon-watch"></span>
        <span>${this.formatDuration(error.duration)}</span>
      </div>
    `

    const elem = document.createElement('p')
    elem.classList.add('error')
    elem.textContent = error.err
    this.results.appendChild(elem)

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
      this.results.appendChild(cell)
    })
  }

  formatDuration(duration) {
    return duration / 1000.0
  }

}
