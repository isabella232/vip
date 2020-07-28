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
import {
	acceptedExtensions,
	findNestedDirectories,
	folderStructureValidation,
	sanitizeFileName,
	doesImageHaveExistingSource,
	logErrorsForInvalidFileTypes,
	logErrorsForInvalidFilenames,
} from '../lib/vip-import-validate-files';

command( { requiredArgs: 1, format: true } )
	.example( 'vip import validate files <file>', 'Validate your media files' )
	.argv( process.argv, async ( arg, options ) => {
		/**
		 * File manipulation
		 *
		 * Manipulating the file path/name to extract the folder name
		 */
		const folder = arg.join(); // File comes in as an array as part of the args- turn it into a string
		arg = url.parse( folder ); // Then parse the file to its URL parts
		const filePath = arg.path; // Extract the path of the file

		/**
		 * Folder structure validation
		 *
		 * Find any nested directories to see if they follow the recommended structure
		 *
		 * Recommended structure: `uploads/year/month`
		 */
		const nestedDirectories = await findNestedDirectories( folder );

		const directories = nestedDirectories.split( '/' );

		folderStructureValidation( directories );

		/**
		 * Individual file validations
		 *
		 * - Media file extension/type validation
		 * - Filename validation
		 * - Intermediate image validation
		 */
		fs.readdir( folder, ( error, files ) => {
			if ( error ) {
				console.error( chalk.red( '✕ Error:' ), `Unable to read directory ${ folder }: ${ error.message }` );
			}

			if ( ! files || ! files.length || files.length <= 0 ) {
				console.error( chalk.red( '✕ Error:' ), 'Media files directory cannot be empty' );
			}

			/**
			 * Media file extension validation
			 *
			 * Ensure that prohibited media file types are not used
			 */

			// Collect files that have invalid file types (extensions) or filenames for error logging
			const errorFileTypes = [];
			const errorFileNames = [];

			// Map through each file to isolate the extension name
			files.map( file => {
				const extension = path.extname( file ); // Extract the extension of the file
				const ext = extension.substr( 1 ); // We only want the ext name minus the period (e.g - .jpg -> jpg)
				const extLowerCase = ext.toLowerCase(); // Change any uppercase extensions to lowercase

				// Check for any invalid file extensions
				// Returns true if ext is invalid; false if valid
				const invalidExtensions = acceptedExtensions.indexOf( extLowerCase ) < 0;

				// Collect files that have no extension, or has an invalid extension for error logging
				if ( ! extension || invalidExtensions ) {
					errorFileTypes.push( file );
				}

				/**
				 * Filename validation
				 *
				 * Ensure that filenames don't contain prohibited characters
				 */

				// Collect files that have invalid file names for error logging
				if ( ! sanitizeFileName( file ) ) {
					errorFileNames.push( file );
				}

				/**
				 * Intermediate image validation
				 *
				 * Detect any intermediate images.
				 *
				 * Intermediate images are copies of images that are resized, so you may have multiples of the same image.
				 * You can resize an image directly on VIP so intermediate images are not necessary.
				 */
				const original = doesImageHaveExistingSource( file, folder );

				if ( original ) {
					console.log(
						chalk.red( '✕' ),
						`Intermediate images: Duplicate files found for: ${ file }\n` +
						'Original file: ' + chalk.blue( `${ original }\n` ) +
						'Intermediate images: ' + chalk.cyan( `${ file }` )
					);
					console.log();
				}
			} );

			/**
			 * Error logging
			 */
			if ( errorFileTypes.length > 0 ) {
				logErrorsForInvalidFileTypes( errorFileTypes );
			}

			if ( errorFileNames.length > 0 ) {
				logErrorsForInvalidFilenames( errorFileNames );
			}
		} );
	} );
