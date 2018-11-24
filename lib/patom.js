'use babel';

import PatomView from './patom-view';
import ConnectionView from './patom-view-connection';
import PatomProvider from './patom-provider';
import { CompositeDisposable, Disposable } from 'atom'
import { Client } from 'pg'

const URI_RESULTS = 'atom://patom-results-view';

export default {

  patomView: null,
  connectionView: null,

  modalPanel: null,
  connectionPanel: null,
  subscriptions: null,

  connection: null,

  pgclient: null,
  patomProvider: null,

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

    this.connectionPanel = atom.workspace.addModalPanel({
      item: this.connectionView.getElement(),
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

      atom.commands.add('atom-workspace', {
        'patom:connect': () => this.connect()
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

  fetch() {
    atom.workspace.open(URI_RESULTS);

    const startDate = new Date();
    this.runQuery((err, res) => {
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
    if (this.pgclinet) {
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
        return this.patomView.setError(err);
      }

      this.pgSetColumns();
    });
  },

  pgSetColumns() {
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
