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
    let innerHTML = `
      <div>
        <span class="icon icon-watch"></span>
        <span>${this.formatDuration(results.duration)}</span>
      </div>
    `

    if (results.rowCount) {
      innerHTML += `
        <div>
          <span class="icon icon-three-bars"></span>
          <span>${results.rowCount} ${results.rowCount == 1 ? 'row' : 'rows'} affected</span>
        </div>
      `
    }

    this.overview.innerHTML = innerHTML

    // make header
    this.headers = results.fields.map(f => f.name)
    this.makeRow(this.headers, 'header', -1)

    // set the number of columns in CSS
    this.gridTemplateColumns = this.headers.map(h => `minmax(${(h.length*9)+10}px,1fr)`)
    this.results.style.gridTemplateColumns = this.gridTemplateColumns.join(' ')

    // make actual results
    results.rows.forEach((r, i) => {
      const names = this.headers.map(header => r[header])
      const className = i % 2 == 1 ? 'light' : null
      this.makeRow(names, className, i)
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

  makeRow(names, className, i) {
    names.map((name, nI) => {
      const cell = document.createElement('span')
      cell.classList.add('row')

      cell.setAttribute('index', i)

      if (className) {
        cell.classList.add(className)
      }

      if (name) {
        cell.textContent = name
      } else {
        cell.textContent = 'NULL'
        cell.classList.add('null')
      }

      // for header, add a draggable element
      if (className == 'header') {
        const drag = document.createElement('span')
        drag.classList.add('draggable')
        drag.setAttribute('draggable', 'true')

        drag.ondragstart = function(e) {
          if (!this.dragImage) {
            this.dragImage = document.createElement('img')
            this.dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            document.body.appendChild(this.dragImage);
          }
          e.dataTransfer.setDragImage(this.dragImage, 0, 0)
        }

        drag.ondrag = (e) => {
          let width = document.querySelectorAll('span.header')[nI].offsetWidth
          this.gridTemplateColumns[nI] = `${Math.max(width+e.offsetX, ((name.length*9)+10))}px`
          this.results.style.gridTemplateColumns = this.gridTemplateColumns.join(' ')
        }
        cell.appendChild(drag)
      }

      // prepare hover function
      cell.onmouseover = () => this.toggleHover(i, true)

      cell.onmouseleave = () => this.toggleHover(i, false)

      return cell
    }).forEach(cell => {
      this.results.appendChild(cell)
    })
  }

  toggleHover(i, add) {
    if (i >= 0) {
      document.querySelectorAll(`span[index='${i}']`)
        .forEach(span => {
          if (add) {
            span.classList.add('hover')
          } else {
            span.classList.remove('hover')
          }
        })
    }
  }

  formatDuration(duration) {
    return duration / 1000.0
  }

}
