#!/usr/bin/env node
// @flow

/**
 * External dependencies
 */
import url from 'url';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

/**
 * Internal dependencies
 */
import command from 'lib/cli/command';

// Accepted media file extensions
const acceptedExtensions = [
	'jpg','jpeg','jpe',
	'gif',
	'png',
	'bmp',
	'tiff','tif',
	'ico',
	'asf',
	'asx',
	'wmv','wmx','wm',
	'avi',
	'divx',
	'mov',
	'qt',
	'mpeg','mpg','mpe','mp4','m4v',
	'ogv',
	'webm',
	'mkv',
	'3gp','3gpp','3g2','3gp2',
	'txt',
	'asc',
	'c','cc','h',
	'srt',
	'csv','tsv',
	'ics',
	'rtx',
	'css',
	'vtt',
	'dfxp',
	'mp3',
	'm4a','m4b',
	'ra',
	'ram',
	'wav',
	'ogg',
	'oga',
	'mid','midi',
	'wma',
	'wax',
	'mka',
	'rtf',
	'js',
	'pdf',
	'class',
	'psd',
	'xcf',
	'doc',
	'pot',
	'pps',
	'ppt',
	'wri',
	'xla','xls','xlt','xlw',
	'mdb','mpp',
	'docx','docm','dotx','dotm',
	'xlsx','xlsm','xlsb','xltx','xltm','xlam',
	'pptx','pptm','ppsx','ppsm','potx','potm','ppam',
	'sldx','sldm',
	'onetoc','onetoc2','onetmp','onepkg','oxps',
	'xps',
	'odt','odp','ods','odg','odc','odb','odf',
	'wp','wpd',
	'key','numbers','pages',
];

command( { requiredArgs: 1, format: true } )
	.example( 'vip import validate files <file>', 'Validate your media files' )
	.argv( process.argv, async ( file, options ) => {
		// File comes in as an array as part of the args- turn it into a string
		const fileString = file.join();

		// Then parse the file to its URL parts
		file = url.parse( fileString );
		
		// Extract the path of the file
		const path = file.path;

		const recommendedFileStructure = () => {
			console.log(
				'Please follow this structure for your media files: \n\n' +
				chalk.underline( 'Single sites:') +
				chalk.yellow(' `uploads/year/month/image.png` \n') +
				' e.g.-' + chalk.yellow('`uploads/2020/06/image.png` \n') +
				chalk.underline('Multisites:') +
				chalk.cyan(' `uploads/sites/siteID/year/month/image.png` \n') +
				' e.g.-' + chalk.cyan('`uploads/sites/5/2020/06/images.png` \n')
			);
		};

		// Ensure media files are stored in an `uploads` directory
		if ( path.search( 'uploads' ) === -1 ) {
			console.error( chalk.red( '✕' ), 'Error: Media files must be in an `uploads` directory' );
			console.log();
			recommendedFileStructure();
		} else {
			console.log( '✅ File structure: Uploads directory exists' );
		}

		// Folder structure validation
		fs.readdir( fileString, ( error, files ) => {
			if ( error ) {
				console.error( chalk.red( '✕ Error:' ), `Unable to read directory ${ fileString }: ${ error.message }` );
			}

			if ( ! files.length || files.length <= 0 ) {
				console.error(chalk.red( '✕ Error:' ), 'Media files directory cannot be empty' );
			}

			const regex = /\b\d{4}\b/g;
			const yearFolder = files.filter( folder => regex.test( folder ) );
		
			if ( files && yearFolder && yearFolder.length === 1 ) {
				console.log('✅ File structure: Year directory exists (format: YYYY)');
			} else {
				console.error( chalk.red( '✕' ), 'Error: Media files must be in an `uploads/YYYY` directory' );
				console.log();
				recommendedFileStructure();
			}
		} )

		const recommendAcceptableFileTypes = () => {
			console.log(
				'Accepted file types: \n\n' +
				chalk.magenta( `${ acceptedExtensions }` )
			);
		};
		
		// Media files extension validation
		const extension = path.extname( fileString ).substr( 1 );

		if ( ! extension ) {
			console.error( chalk.red( '✕' ), `Error: Invalid file type for file: ${ fileString }` );
			console.log();
			recommendAcceptableFileTypes();
		}
	} );