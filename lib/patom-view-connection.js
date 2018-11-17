'use babel';

export default class ConnectionView {
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

    // fields
    const fields = ['user', 'host', 'database', 'password', 'port'];
    const connection = this.state.connection;

    let input;
    fields.forEach((field, i) => {
      input = document.createElement('atom-text-editor');
      input.setAttribute('mini', '');
      input.setAttribute('tabindex', `${i+1}`);
      input.setAttribute('placeholder-text', field);
      input.classList.add('editor', 'mini');
      input.id = `patom-connection-${field}`

      // set the saved value
      if (connection) {
        input.getModel().setText(connection[field])
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
    return {
      user: document.getElementById('patom-connection-user').getModel().getText(),
      host: document.getElementById('patom-connection-host').getModel().getText(),
      database: document.getElementById('patom-connection-database').getModel().getText(),
      password: document.getElementById('patom-connection-password').getModel().getText(),
      port: document.getElementById('patom-connection-port').getModel().getText(),
    }
  }

}
