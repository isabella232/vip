// @flow
const promptly = require( 'promptly' );
const colors = require( 'colors' );

export type Tuple = {
	key: string,
	value: string,
};

module.exports = {};

module.exports.confirm = async function( values: Array<Tuple>, message: string ): Promise<boolean> {
	console.log( m( values ) );
	return promptly.confirm( message );
};

function m( values: Array<Tuple> ): string {
	const lines = [];

	lines.push( '===================================' );
	for ( const i of values ) {
		let v = i.value;

		switch ( i.key.toLowerCase() ) {
			case 'environment':
				if ( 'production' === v.toLowerCase() ) {
					v = colors.red( v.toUpperCase() );
				} else {
					v = colors.blue( v.toLowerCase() );
				}
				break;
		}

		lines.push( `+ ${ i.key }: ${ v }` );
	}
	lines.push( '===================================' );

	return lines.join( '\n' );
}
