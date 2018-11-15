'use babel';

export default class ConnectionView {

  constructor(serializedState) {
    // Create root element
    this.element = this.init();
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

  init() {
    const elem = document.createElement('table');
    const fields = ['user', 'host', 'database', 'password', 'port'];

    let input;
    fields.forEach(field => {
      input = document.createElement('atom-text-editor');
      input.setAttribute('mini', '');
      input.classList.add('editor', 'mini');
      input.tabindex = '-1';
      input.setAttribute('placeholder-text', field);

      elem.appendChild(input);
    });

    input = document.createElement('button');
    input.classList.add('btn');
    input.textContent = 'Save'
    elem.appendChild(input);

    return elem;
  }

  getElement() {
    return this.element;
  }

}
