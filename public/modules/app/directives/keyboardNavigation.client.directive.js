
// classes to handle KeyBoard Navigation
// button  .button-handler
// link  .link-handler
// dialog  .dialog-handler
// horizontalNavigation .horizontal-navigation  and add sibling parent class in data-parent attr
// verticalNavigation .vertical-navigation  and add sibling parent class in data-parent attr
// to stop keyboard navigation add  a class .prevent-key-handler




// target is different in keyup and keydown
//keyup gives the next element


'use strict';
define([],function(){

    return(['keyboardNavigation',['$rootScope',function($rootScope){

        function link(scope, element, attrs) {

            var buttonHandler = 'button-handler',
                linkHandler = 'link-handler',
                horizontalNavigation = 'horizontal-navigation',
                verticalNavigation = 'vertical-navigation',
                navigationParent = 'navigation-parent',
                focussable = 'focussed',
                preventKeyHandler = 'prevent-key-handler',
                prevFocusedEle, currentFocusedEle,focusEle,focusListItem ;



            var focusPreviousElement = function(target, targetClass, event){
                var parentClass = target.parents('.'+navigationParent+ ':first'),
                    navigationElements = parentClass.find('.'+targetClass),
                    navEleLength = navigationElements.length,
                    targetIndex = navigationElements.index(target),
                    prevTargetElement =  navigationElements.eq(((targetIndex)-1)%navEleLength);

                if(prevTargetElement ){
                    event.preventDefault();
                    prevTargetElement.focus(); //move focus to previous sibling

                }
            };

            var focusNextElement = function(target, targetClass,event){
                var parentClass = target.parents('.'+navigationParent +':first'),
                    navigationElements = parentClass.find('.'+targetClass),
                    targetIndex = navigationElements.index(target),
                    navEleLength = navigationElements.length,
                    nextTargetFocusElement =  navigationElements.eq(((targetIndex)+ 1)%navEleLength);


                if(nextTargetFocusElement){
                    event.preventDefault();
                    nextTargetFocusElement.focus(); //move focus to previous sibling

                }
            };

            var focusOnElement = function(event) {
                var currentTarget = $(event.target);
                if (currentTarget.parents('.dropdown-menu').length === 0 && currentTarget.parents('.' + navigationParent).length === 0) {
                    if (event.which === 40 || event.which === 38) {
                        event.preventDefault();
                        focusListItem.focus().addClass('focussed');
                        prevFocusedEle = focusListItem;

                    }


                }
            };


            //remove focussable class
            //click on same element
            //remove focus class from previous element
            element.on('click','.'+focussable,function(){
                $(this).removeClass(focussable);
               // prevFocusedEle = null;


            });
            element.on('blur','.'+focussable,function(){
                $(this).removeClass(focussable);
                prevFocusedEle = null;


            });

            $rootScope.$on('focusFirstEle', function(event,data) {
                focusListItem = data;

                element.on('keydown', focusOnElement);


            });

            $rootScope.$on('$stateChangeStart',function(){
                element.off('keydown',focusOnElement);
            });




            //add focussable class
            element.on('keyup','[tabindex][tabindex!=-1],a[tabindex!=-1]',function(event) {

                //add focus class only on these keys
                if((event.which === 9) || (event.which === 37 || event.which === 38 || event.which === 39 || event.which === 40) ){
                    
                    currentFocusedEle = $(event.target);

                    if(currentFocusedEle.hasClass(preventKeyHandler) || currentFocusedEle.parents('.'+preventKeyHandler).length)
                        return;

                    if(!currentFocusedEle.is(prevFocusedEle)){
                        currentFocusedEle.addClass(focussable);
                        prevFocusedEle = currentFocusedEle;
                    }
                }


        });


            // keybaord navigation implementation
            element.on('keydown','.'+buttonHandler +',.'+linkHandler+',ul.dropdown-menu,.'+verticalNavigation+',.'+horizontalNavigation,function(event) {

                var target = $(event.currentTarget),
                    targetElement =$(event.target);
                
                switch(event.which){
                    case 13: // enter key
                        if(target.hasClass(buttonHandler) || target.hasClass(linkHandler) || target.hasClass(verticalNavigation) ||target.hasClass(horizontalNavigation) ) {
                            $(this).click();
                        }
                        break;
                    case 32: // space key
                        if(target.hasClass(buttonHandler)) {
                            event.preventDefault(); // spacebar move the pageDown
                            $(this).click();
                        }else if(target.hasClass('dropdown-menu')){     // spaceBar should not work in Dropdown
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    case 9: //tab key
                        if(target.hasClass('dropdown-menu')) {
                            var targetListItem = targetElement.parent('li');
                            if(targetListItem.is(':last-child') && !event.shiftKey ){
                                event.preventDefault();
                                targetListItem.siblings(':first').children('a').focus();

                            }else if(event.shiftKey && targetListItem.is(':first-child') ){
                                event.preventDefault();
                                targetListItem.siblings(':last').children('a').focus();

                            }
                        }
                        break;

                    case 38:// Move selection up

                        if(target.hasClass(verticalNavigation)) {
                            focusPreviousElement(target, verticalNavigation,event);

                            break;

                        }else if(target.hasClass('dropdown-menu')&& target.data('navigation') && targetElement.parent('li').is(':first-child')){

                            //prevent scroll and further processing
                            event.preventDefault();
                            event.stopPropagation();

                            targetElement.parent('li').siblings(':last').children('a').focus();

                        }
                        break;


                    case 37://left key

                        if(target.hasClass(horizontalNavigation)) {
                            focusPreviousElement(target, horizontalNavigation,event);
                        }
                        break;


                    case 40://Move selection down

                        if(target.hasClass(verticalNavigation)) {
                            focusNextElement(target, verticalNavigation, event);

                            break;

                        }else if(target.hasClass('dropdown-menu')&& target.data('navigation') && targetElement.parent('li').is(':last-child')){

                            //prevent scroll and further processing
                            event.preventDefault();
                            event.stopPropagation();

                            targetElement.parent('li').siblings(':first').children('a').focus();

                        }
                        break;

                    case 39://right key

                        if(target.hasClass(horizontalNavigation)) {
                            focusNextElement(target, horizontalNavigation,event);
                        }
                        break;

                }
                });

            }

        return{
            restrict:'A',
            link:link
        };

    }]]);



});

