/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
	config.plugins = 'basicstyles,dialogui,dialog,clipboard,button,toolbar,enterkey,entities,floatingspace,indent,indentlist,list,undo,panelbutton,panel,floatpanel,colorbutton,removeformat,find,pastefromword';
	config.skin = 'moono';
	// %REMOVE_END%

	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	// Dialog windows are also simplified.
	config.removeDialogTabs = 'link:advanced';

    //self configuration
    config.enterMode = CKEDITOR.ENTER_BR;
    config.shiftEnterMode = CKEDITOR.ENTER_BR;
    config.uiColor = '#dddddd';
    /*config.extraPlugins = '';*/
    config.pasteFromWordNumberedHeadingToList = false;
    config.pasteFromWordRemoveFontStyles = true;
    config.pasteFromWordRemoveStyles = true;
    config.undoStackSize = 30;
};
