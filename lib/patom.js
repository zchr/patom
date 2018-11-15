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

  pgclient: new Client({
    user: 'Zach',
    host: 'localhost',
    database: 'ga_voters',
    password: '',
    port: 5432,
  }),

  activate(state) {
    // connect to PG
    this.pgclient.connect()

    this.patomView = new PatomView(state.patomViewState);
    this.connectionView = new ConnectionView(state.patomViewState);

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

  connect() {
    if (this.connectionPanel.isVisible()) {
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
  }
};
