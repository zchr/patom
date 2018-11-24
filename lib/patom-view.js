'use babel';

export default class PatomView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('table')
    this.element.classList.add('patom')
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }
  clearElement() {
    // remove old children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'Query Output';
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    return 'atom://patom-results-view';
  }

  setResults(results) {
    this.clearElement();

    // make header
    this.makeRow(results.fields.map(f => f.name), true);

    // make actual results
    results.rows.forEach(r => {
      const names = Object.values(r);
      this.makeRow(names);
    });

    return this.element;
  }

  setError(error) {
    this.clearElement();
    const elem = document.createElement('h1')
    elem.textContent = error
    this.element.appendChild(elem)

    return this.element;
  }

  makeRow(names, isHeader) {
    const elem = document.createElement('tr')
    const cellType = isHeader ? 'th' : 'td'

    names.map(name => {
      const cell = document.createElement(cellType)
      if (name) {
        cell.textContent = name
      } else {
        cell.textContent = 'NULL'
        cell.classList.add('null')
      }

      return cell
    }).forEach(cell => {
      elem.appendChild(cell)
    })

    this.element.appendChild(elem)
  }

}
