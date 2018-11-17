'use babel';

import PatomView from './patom-view';
import ConnectionView from './patom-view-connection';
import { CompositeDisposable } from 'atom'
import { Client } from 'pg'

export default {

  patomView: null,
  connectionView: null,

  modalPanel: null,
  connectionPanel: null,
  subscriptions: null,

  connection: null,

  pgclient: null,

  activate(state) {
    // see if a connection was saved
    const connection = atom.config.get('patom.connection')

    // connect to PG
    this.pgConnect(connection)

    this.patomView = new PatomView(state.patomViewState);
    this.connectionView = new ConnectionView({
      cancel: () => this.connect(false),
      save: () => this.connect(true),
      connection
    });

    this.modalPanel = atom.workspace.addFooterPanel({
      item: this.patomView.getElement(),
      visible: false
    });

    this.connectionPanel = atom.workspace.addModalPanel({
      item: this.connectionView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'patom:fetch': () => this.fetch()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'patom:connect': () => this.connect()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.patomView.destroy();
  },

  serialize() {
    return {
      patomViewState: this.patomView.serialize()
    };
  },

  fetch() {
    if (!this.modalPanel.isVisible()) {
      this.modalPanel.show();
    }

    this.runQuery((err, res) => {
      if (err) {
        this.patomView.setError(err)
      } else {
        this.patomView.setResults(res);
      }
    });
  },

  connect(save) {
    if (this.connectionPanel.isVisible()) {
      if (save) {
        const connection = this.connectionView.getValues();
        this.pgConnect(connection);
        atom.config.set('patom.connection', connection); // save
      }
      this.connectionPanel.hide();
    } else {
      this.connectionPanel.show();
    }
  },

  runQuery(fn) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const selection = editor.getSelectedText();
      this.pgclient.query(selection, fn)
    }
  },

  pgConnect(connection) {
    // close the reuslts window
    if (this.modalPanel) { this.modalPanel.hide(); }

    if (this.pgclient) {
      this.pgclient.end();
    }
    this.pgclient = new Client(connection || {});
    this.pgclient.connect((err) => {
      if (err) {
        this.patomView.setError(err);
      }
    });
  }
};
