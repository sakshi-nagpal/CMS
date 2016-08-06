'use strict';

define([

], function() {
    return ['notificationService', [function () {

        return {

            showNotification: function(settings){

                var values = {
                    theme:(settings.theme || 'baloo-notific8'),
                    sticky: (settings.sticky || false),
                    horizontalEdge:(settings.horizontalEdge || 'top'),
                    verticalEdge: (settings.verticalEdge || 'right'),
                    value: settings.message,
                    heading: (settings.heading || 'Oops !!')
                };

                if (!values.sticky) {
                    values.life = settings.life || 2000;
                }
                $.notific8('remove');
                $.notific8($.trim(values.value), values);

            },
            hideNotification: function(){
                $.notific8('remove');
            }

        };
    }]];
});
