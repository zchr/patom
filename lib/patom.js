'use babel';

import PatomView from './patom-view';
import ConnectionView from './patom-view-connection';
import ShortcutsView from './patom-view-shortcuts';
import PatomProvider from './patom-provider';
import { CompositeDisposable, Disposable } from 'atom'
import { Client } from 'pg'

const URI_RESULTS = 'atom://patom-results-view';

export default {

  patomView: null,
  connectionView: null,
  shortcutsView: null,

  modalPanel: null,
  connectionPanel: null,
  shortcutsPanel: null,
  subscriptions: null,

  connection: null,
  shortcuts: [],

  pgclient: null,
  patomProvider: null,

  activate(state) {
    // see if a connection was saved
    const connection = atom.config.get('patom.connection');

    // see if shortcuts were saved
    this.shortcuts = atom.config.get('patom.shortcuts') || [];

    // connect to PG
    this.pgConnect(connection);

    this.patomView = new PatomView(state.patomViewState);

    this.connectionView = new ConnectionView({
      cancel: () => this.connect(false),
      save: () => this.connect(true),
      connection
    });

    this.shortcutsView = new ShortcutsView({
      cancel: () => this.shortcut(false),
      save: () => this.shortcut(true),
      shortcuts: this.shortcuts
    });

    this.connectionPanel = atom.workspace.addModalPanel({
      item: this.connectionView.getElement(),
      visible: false
    });

    this.shortcutsPanel = atom.workspace.addModalPanel({
      item: this.shortcutsView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri == URI_RESULTS) {
          return this.patomView;
        }
      }),

      atom.commands.add('atom-workspace', {
        'patom:fetch': () => this.fetch()
      }),

      // shortcuts
      atom.commands.add('atom-workspace', {
        'patom:fetch-3': () => this.fetch(3)
      }),
      atom.commands.add('atom-workspace', {
        'patom:fetch-4': () => this.fetch(4)
      }),
      atom.commands.add('atom-workspace', {
        'patom:fetch-5': () => this.fetch(5)
      }),

      atom.commands.add('atom-workspace', {
        'patom:connect': () => this.connect()
      }),

      atom.commands.add('atom-workspace', {
        'patom:fetch-columns': () => this.fetchColumns()
      }),

      atom.commands.add('atom-workspace', {
        'patom:shortcuts': () => this.shortcut()
      })

    );

    this.patomProvider = new PatomProvider();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.patomView.destroy();
  },

  provide() {
    return this.patomProvider;
  },

  serialize() {
    return {
      patomViewState: this.patomView.serialize()
    };
  },

  fetch(shortcut) {
    let prefix = '';
    if (shortcut) {
      prefix = this.shortcuts.find(s => s.id == shortcut).prefix
    }

    atom.workspace.open(URI_RESULTS);

    const startDate = new Date();
    this.runQuery(prefix, (err, res) => {
      const duration = new Date() - startDate;

      console.log(err, res);
      if (err) {
        return this.patomView.setError({ err, duration});
      }
      res.duration = duration;
      this.patomView.setResults(res);
    });
  },

  fetchColumns() {
    if (this.pgclient) {
      this.pgSetColumns();
    } else {
      this.connect();
    }
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

  shortcut(save) {
    if (this.shortcutsPanel.isVisible()) {
      if (save) {
        this.shortcuts = this.shortcutsView.getValues();
        atom.config.set('patom.shortcuts', this.shortcuts); // save
      }
      this.shortcutsPanel.hide();
    } else {
      this.shortcutsPanel.show();
    }
  },

  runQuery(prefix, fn) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const selection = editor.getSelectedText();
      if (selection) {
        this.pgclient.query(`${prefix} ${selection}`, fn);
      }
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
        return this.patomView.setError(err);
      }

      this.pgSetColumns();
    });
  },

  pgSetColumns() {
    console.log('getting columns');

    this.pgclient.query('select distinct column_name \
      from information_schema.columns \
      where table_schema = \'public\' \
      union \
      select distinct table_name \
      from information_schema.tables \
      where table_schema = \'public\' \
      ', (err, res) => {
      if (err) {
        return this.patomView.setError(err);
      }

      const columns = res.rows.map(r => {
        return r.column_name
      })
      this.patomProvider.setSuggestions(columns);
    });
  }
};
