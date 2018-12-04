# Patom
This is an [Atom package](https://atom.io/packages/patom) that lets you interact with Postgres databases from within Atom. 

**Quick note**: I threw this together as a side project, mainly so I could interact with my local PG. This was not made with scale/security in mind, so please be careful. It handles auth with [node-postgres](https://node-postgres.com/).

![Typing SQL and seeing results with autocomplete](https://i.imgur.com/gDHOnX2.png)

----
## What it does
It's pretty simple. Highlight some code in Atom and pres Cmd-1. Bam, output is in the dock below. It's got an impressively short list of features:

 - Save your connection across sessions
 - Autocomplete table names and columns
 - Set your own keyboard shortcuts, Cmd-3 through Cmd-5
     - Shortcuts all contain `$$`, which is where the highlighted SQL query will get inserted

![Shortcuts pane](https://i.imgur.com/If8PDqb.png)

![Save connection pane](https://i.imgur.com/eULZ8WI.png)
 
All of these are manageable via the Packages > Patom menu.

The package talks to PG via [node-postgres](https://node-postgres.com/), so the makers and maintainers deserve a massive thanks.

----

## License
MIT. Please submit issues slash feature requests, or consider opening a PR. 
