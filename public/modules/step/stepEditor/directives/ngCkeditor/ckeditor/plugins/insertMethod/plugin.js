/**
 * Created by mohit on 2/3/2015.
 */

CKEDITOR.plugins.add('insertMethod', {
    init: function(editor) {
        editor.ui.addButton('InsertMethod', {
            label: 'Insert Method',
            command: 'insertMethod',
            toolbar: 'insert',
            iconClass: 'baloo-font baloo-icon-add-method'
        });

        editor.addCommand( 'insertMethod', {
            exec: function( editor ) {
                editor.fire('insertMethod');
            }
        });
    }
});
