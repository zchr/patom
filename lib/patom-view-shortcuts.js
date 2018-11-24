'use babel';

const FIELDS = ['3', '4', '5']

export default class ShortcutsView {
  constructor(state) {
    // Create root element
    this.state = state;
    this.element = this.init();
    this.element.classList.add('patom')
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  init() {
    const elem = document.createElement('div');

    const shortcuts = this.state.shortcuts;

    let input;
    FIELDS.forEach((field, i) => {
      input = document.createElement('atom-text-editor');
      input.setAttribute('mini', '');
      input.setAttribute('tabindex', `${i+1}`);
      input.setAttribute('placeholder-text', `Cmd-${field}`);
      input.classList.add('editor', 'mini');
      input.id = `patom-shortcuts-${field}`

      // set the saved value
      if (shortcuts) {
        input.getModel().setText(shortcuts[field])
      }

      elem.appendChild(input);
    });

    // save button
    input = document.createElement('button');
    input.classList.add('btn');
    input.textContent = 'Save';
    input.onclick = this.state.save;
    elem.appendChild(input);

    // cancel button
    input = document.createElement('button');
    input.classList.add('btn');
    input.textContent = 'Cancel';
    input.onclick = this.state.cancel;
    elem.appendChild(input);

    return elem;
  }

  getElement() {
    return this.element;
  }

  getValues() {
    return FIELDS.map(field => {
      return {
        id: field,
        prefix: document.getElementById(`patom-shortcuts-${field}`).getModel().getText()
      }
    })
  }
}
