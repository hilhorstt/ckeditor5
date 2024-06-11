/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/filedialogbuttonview
 */

import View from '../view.js';
import ButtonView from './buttonview.js';
import type { ButtonExecuteEvent } from './button.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The file dialog button view.
 *
 * This component provides a button that opens the native file selection dialog.
 * It can be used to implement the UI of a file upload feature.
 *
 * ```ts
 * const view = new FileDialogButtonView( locale );
 *
 * view.set( {
 * 	acceptedType: 'image/*',
 * 	allowMultipleFiles: true
 * 	label: t( 'Insert image' ),
 * 	icon: imageIcon,
 * 	tooltip: true
 * } );
 *
 * view.on( 'done', ( evt, files ) => {
 * 	for ( const file of Array.from( files ) ) {
 * 		console.log( 'Selected file', file );
 * 	}
 * } );
 * ```
 */
export default class FileDialogButtonView extends ButtonView {
	/**
	 * The button view of the component.
	 *
	 * @deprecated
	 */
	public buttonView: ButtonView;

	/**
	 * A hidden `<input>` view used to execute file dialog.
	 */
	private _fileInputView: FileInputView;

	/**
	 * Accepted file types. Can be provided in form of file extensions, media type or one of:
	 * * `audio/*`,
	 * * `video/*`,
	 * * `image/*`.
	 *
	 * @observable
	 */
	declare public acceptedType: string;

	/**
	 * Indicates if multiple files can be selected. Defaults to `true`.
	 *
	 * @observable
	 */
	declare public allowMultipleFiles: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		// For backward compatibility.
		this.buttonView = this;

		this._fileInputView = new FileInputView( locale );
		this._fileInputView.bind( 'acceptedType' ).to( this );
		this._fileInputView.bind( 'allowMultipleFiles' ).to( this );

		this._fileInputView.delegate( 'done' ).to( this );

		this.on<ButtonExecuteEvent>( 'execute', () => {
			this._fileInputView.open();
		} );

		this.extendTemplate( {
			attributes: {
				class: 'ck-file-dialog-button'
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.children.add( this._fileInputView );
	}
}

/**
 * The hidden file input view class.
 */
class FileInputView extends View<HTMLInputElement> {
	/**
	 * Accepted file types. Can be provided in form of file extensions, media type or one of:
	 * * `audio/*`,
	 * * `video/*`,
	 * * `image/*`.
	 *
	 * @observable
	 */
	declare public acceptedType?: string;

	/**
	 * Indicates if multiple files can be selected. Defaults to `false`.
	 *
	 * @observable
	 */
	declare public allowMultipleFiles: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'acceptedType', undefined );
		this.set( 'allowMultipleFiles', false );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'input',

			attributes: {
				class: [
					'ck-hidden'
				],
				type: 'file',
				tabindex: '-1',
				accept: bind.to( 'acceptedType' ),
				multiple: bind.to( 'allowMultipleFiles' )
			},

			on: {
				// Removing from code coverage since we cannot programmatically set input element files.
				change: bind.to( /* istanbul ignore next -- @preserve */ () => {
					if ( this.element && this.element.files && this.element.files.length ) {
						this.fire<FileInputViewDoneEvent>( 'done', this.element.files );
					}

					this.element!.value = '';
				} )
			}
		} );
	}

	/**
	 * Opens file dialog.
	 */
	public open(): void {
		this.element!.click();
	}
}

/**
 * Fired when file dialog is closed with file selected.
 *
 * ```ts
 * view.on( 'done', ( evt, files ) => {
 * 	for ( const file of files ) {
 * 		console.log( 'Selected file', file );
 * 	}
 * }
 * ```
 */
export type FileInputViewDoneEvent = {
	name: 'done';
	args: [ files: FileList ];
};
