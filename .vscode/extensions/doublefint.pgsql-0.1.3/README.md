# pgsql extension

This extension is fixed clone of [postgresql](https://marketplace.visualstudio.com/items?itemName=JPTarquino.postgresql) by [JPTarquino](https://github.com/jptarqu/VSCodeExtension-PostgreSQL)

## Features:
- Execute sql file into Postgres (*Ctrl+F5*) via [psql](https://www.postgresql.org/docs/current/static/app-psql.html)
- Colorization - _converted from [mulander](https://github.com/mulander/postgres.tmbundle)_
- Completion lists for keywords - _copied from the Postgres [documentation](https://www.postgresql.org/docs/current/static/sql-keywords-appendix.html#KEYWORDS-TABLE)_
- Few snippets ( *Ctrl+Space, type 'pg'* )

The extension recognizes the \*.sql, \*.ddl, \*.dml, \*.pgsql extension as sql files intended to be run in Postgres

<img src="https://raw.githubusercontent.com/doublefint/vscode-pgsql/master/images/example.gif" alt="demo" style="width:480px;"/>

## Usage

- Setup **psql** is in the OS executable path
- Customize Postgress connection ( settings in workspace ):
```javascript
{ "pgsql.connection": "postgres://username:password@host:port/database" }
```

- Open file with pgsql type and run ( press **Ctrl+F5** or Cmd+F5 on Mac )
- For snippets press **Ctrl+Space**, type '**pg**' 
