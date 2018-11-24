# Patom
This is an Atom package that lets you interact with Postgres databases from within Atom. 

**Quick note before I get into the depths of the README**: I threw this together as a side project, mainly so I could interact with my local PG. This was not made with security in mind, so please be careful, especially with inputting passwords--local servers are great because they are, by default, password free.

----
## What it does
It's got a fantastic and short list of features:

 - Saves your connection across sessions
 - Autocompletes table names and columns
 - Lets you set your own keyboard shortcuts, Cmd-1 through Cmd-9
 
The package talks to PG via [node-postgres](https://node-postgres.com/), so the makers and maintainers deserve a massive thanks.

----

## License
MIT. Please submit issues or consider opening a PR. 
