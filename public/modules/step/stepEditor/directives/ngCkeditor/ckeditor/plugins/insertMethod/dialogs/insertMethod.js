/**
 * Created by mohit on 2/5/2015.
 */

CKEDITOR.dialog.add( 'insertMethodDialog', function( editor ) {
    var dialog,
        methodTypes = editor.config.methodTypes,
        elements = [];

    for(var index= 0, length=methodTypes.length; index<length; ++index) {
        elements.push({
            type: 'button',
            id: methodTypes[index],
            label: methodTypes[index],
            onClick: function() {
                dialog.hide();
                editor.fire('insertMethodDialog.methodSelected', this.label);
            }
        });
    }

    return {
        title: 'Method Types',
        minWidth: 400,
        minHeight: 200,
        buttons: [ CKEDITOR.dialog.cancelButton ],
        resizable:      CKEDITOR.DIALOG_RESIZE_NONE,
        contents: [
            {
                id: 'methodTypes',
                label: 'Choose Method',
                elements: elements
            }
        ],
        onShow: function() {
            dialog = this;
        },
        onCancel: function() {
            editor.fire('insertMethodDialog.cancel');
        }
    };
});
