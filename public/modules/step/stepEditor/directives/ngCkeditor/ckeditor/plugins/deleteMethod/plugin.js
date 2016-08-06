/**
 * Created by Keshav on 3/25/2015.
 */

CKEDITOR.plugins.add('deleteMethod', {
    init: function(editor) {
        editor.ui.addButton('DeleteMethod', {
            label: 'Delete Method',
            command: 'deleteMethod',
            toolbar: 'delete',
            iconClass: 'baloo-font baloo-icon-trash'
        });

       editor.addCommand( 'deleteMethod', {
            exec: function( editor ) {
                editor.fire('deleteMethod');
            }
        });
    }
});

