const data = require('./signature.json')

/*const parse = args => {
    if ( !args ) return []
    return args.split(",").map( sp => ({ label: sp }))
}*/

const signatures = data.map( sd => {
    return {
        name: sd.nm,
        label: sd.nm + "( " + sd.args + " )",
        documentation: sd.nt,
        parameters: sd.args.split(",").map( sp => ({ label: sp }))
    }
})

const callLookup = ( code, commas )=>{
    const call = { commas }
    let char='', i = code.length-1;
    for ( ;i>=0; i-- ){
        char = code[i]
        if ( char === ',' ) call.commas++
        if ( char === '(' ) { // first open parenthesis
            let rest = code.substring( 0, i ) + "("
            var matches = rest.match( /\S+(?=\()/g )
            if ( matches.length ){
                //last sequence before (
                call.name = matches[ matches.length - 1 ] 
            } 
            break
        }
    }
    return call
}

// walk back (and up) 
// find word before first open parenthesis
// also calculate commas before first open parenthesis
// return { word, commas: count }
// NOTE: only for simple cases
const walkbackToCall = ( doc, pos ) => {
    
    let line = pos.line
    let code = doc.lineAt( line ).text
    code = code.substring( 0, pos.character )
    
    let commas = 0, maxLines = 10, call = { }

    while ( !call.name ) {
        call = callLookup( code, commas )
        commas = call.commas
        
        if (call.name) break
        if (( line-- < 0 ) || ( maxLines-- < 0 )) break
        
        code = doc.lineAt( line ).text
    }
    return call

}

exports.default = {
    provideSignatureHelp: ( doc, pos ) => { // function called at "(" and "," 

        const call = walkbackToCall( doc, pos ) // returns { name: 'token before'}
        if ( !call.name ) return Promise.resolve( null )
        const mask = call.name.toLowerCase()
        const filtered = signatures.filter( s => ~s.name.indexOf( mask ) && ( s.parameters.length > call.commas ) )
        return Promise.resolve( { activeParameter: call.commas, activeSignature: 0, signatures: filtered } )

    }
}