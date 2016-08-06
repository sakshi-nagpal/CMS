/*!
 * Nestable jQuery Plugin - Copyright (c) 2012 David Bushell - http://dbushell.com/
 * Dual-licensed under the BSD or MIT licenses
 */
;(function($, window, document, undefined)
{
    var hasTouch = 'ontouchstart' in document;

    /**
     * Detect CSS pointer-events property
     * events are normally disabled on the dragging element to avoid conflicts
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
     */
    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

    var defaults = {
        $parent         : $(document.body),
        containment     : null,
        listNodeName    : 'ol',
        itemNodeName    : 'li',
        rootClass       : 'dd',
        listClass       : 'dd-list',
        itemClass       : 'dd-item',
        dragClass       : 'dd-dragel',
        handleClass     : 'dd-handle',
        placeClass      : 'dd-placeholder',
        //noDragClass     : 'dd-nodrag',
        emptyClass      : 'dd-empty',

        //BALOO - revised by Sakshi Nagpal
        //No need of expand and collapse functionality
        /*collapsedClass  : 'dd-collapsed',
        expandBtnHTML   : '<button data-action="expand" type="button">Expand</button>',
        collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',*/

        group           : 0,
        maxDepth        : 5,
        threshold       : 20,

        //BALOO- Revised by Mohit Kansal
        //enable scroll while dragging
        scroll           : true,
        scrollSensitivity: 1,
        scrollSpeed      : 5,
        scrollInterval   : 10,
        scrollTriggers   : {
            top: 40,
            left: 40,
            right: -40,
            bottom: -40
        },

        isActionDrag    : false,
        isMethodDrag    :false,
        isStepDrag      :false

    };

    function Plugin(element, options)
    {
        this.w  = $(document);
        this.el = $(element);
        this.scrollParent = null;
        this.options = $.extend({}, defaults, options);

        if(!this.options.containment) {
            this.options.containment = this.el;
        }
    }

    Plugin.prototype = {

        init: function()
        {
            var list = this;

            list.reset();

            list.el.data('movable-group', this.options.group);

            if(list.options.isMethodDrag || list.options.isStepDrag){
                list.placeEl = $('<div class="' + list.options.placeClass + '"></div>');
            }
            else{
                list.placeEl = $('<li class="' + list.options.placeClass + '"/>');
            }

            //BALOO - revised by Sakshi Nagpal
            //No need of expand and collapse functionality

            /*$.each(this.el.find(list.options.itemNodeName), function(k, el) {
                list.setParent($(el));
            });

            list.el.on('click', 'button', function(e) {
                if (list.dragEl) {
                    return;
                }
                var target = $(e.currentTarget),
                    action = target.data('action'),
                    item   = target.parent(list.options.itemNodeName);
                if (action === 'collapse') {
                    list.collapseItem(item);
                }
                if (action === 'expand') {
                    list.expandItem(item);
                }
            });*/

            var clearAnimateScrollTimer = function(){
                clearInterval(list.animateScrollTimer);
                list.animateScrollTimer = null;
            };

            var onStartEvent = function(e)
            {
                var handle = $(e.target);
                if (!handle.hasClass(list.options.handleClass)) {
                    if (handle.closest('.' + list.options.noDragClass).length) {
                        return;
                    }
                    handle = handle.closest('.' + list.options.handleClass);
                }

                if (!handle.length || list.dragEl) {
                    return;
                }

                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }

                e.preventDefault();
                list.dragStart(e.touches ? e.touches[0] : e);
            };

            var onDragElMouseMoveEvent = function(e) {
                var mouseTop = e.pageY - list.mouse.offsetY,
                    containmentTop = list.options.containment[0].offsetTop,
                    containmentHeight = list.options.containment.outerHeight();

                if(mouseTop >= containmentTop && mouseTop <= containmentTop + containmentHeight) {
                    onMoveEvent(e);
                }
            };
            var onMoveEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragMove(e.touches ? e.touches[0] : e);
                }
            };

            var onLeaveEvent = function(e) {

                var scrollParent = list.scrollParent;
                if (list.dragEl) {

                    if(scrollParent != document && scrollParent.tagName != 'HTML') {
                        if ((list.options.scrollTriggers.bottom + scrollParent.offsetHeight) - (e.pageY - scrollParent.offsetTop) < list.options.scrollSensitivity) {
                             list.animateScrollTimer = setInterval(function () {
                                 scrollParent.scrollTop += list.options.scrollSpeed;

                                 if(scrollParent.scrollTop >= scrollParent.scrollHeight - scrollParent.outerHeight) {
                                 clearAnimateScrollTimer();
                                 }
                             }, list.options.scrollInterval);
                         } else if (e.pageY - scrollParent.offsetTop - list.options.scrollTriggers.top < list.options.scrollSensitivity) {
                             list.animateScrollTimer = setInterval(function () {
                                 scrollParent.scrollTop -= list.options.scrollSpeed;

                                 if(scrollParent.scrollTop <= 0) {
                                 clearAnimateScrollTimer();
                                 }
                             }, list.options.scrollInterval);
                         }
                    } else {
                        if( (list.options.scrollTriggers.bottom + $(window).height()) - (e.pageY - $(document).scrollTop()) < list.options.scrollSensitivity) {
                            list.animateScrollTimer = setInterval(function () {
                                $(document).scrollTop($(document).scrollTop() + list.options.scrollSpeed) ;

                                if($(document).scrollTop() >= $('body')[0].scrollHeight - $(window).height()) {
                                    clearAnimateScrollTimer();
                                }
                            }, list.options.scrollInterval);
                        } else if(e.pageY - $(document).scrollTop() -list.options.scrollTriggers.top < list.options.scrollSensitivity) {
                            list.animateScrollTimer = setInterval(function () {
                                $(document).scrollTop($(document).scrollTop() - list.options.scrollSpeed) ;
                                if($(document).scrollTop() <= 0) {
                                    clearAnimateScrollTimer();
                                }
                            }, list.options.scrollInterval);
                        }
                    }

                }

            };

            var onEnterEvent = function(e){
                if(list.animateScrollTimer)
                    clearAnimateScrollTimer();
            };

            var onEndEvent = function(e)
            {
                if (list.dragEl) {

                    e.preventDefault();
                    clearAnimateScrollTimer();
                    list.dragStop(e.touches ? e.touches[0] : e);
                }
            };

            if (hasTouch) {
                list.el[0].addEventListener('touchstart', onStartEvent, false);
                window.addEventListener('touchmove', onMoveEvent, false);
                window.addEventListener('touchend', onEndEvent, false);
                window.addEventListener('touchcancel', onEndEvent, false);
            }

            //BALOO - Revised by Mohit Kansal
            if(list.options.isActionDrag) {
                list.options.containment.parent().on('mousedown', onStartEvent);
                list.options.containment.on('mousemove', onMoveEvent);

            } else if(list.options.isMethodDrag){
                list.options.containment.on(
                    {
                        "mousedown": onStartEvent,
                        "mousemove": onMoveEvent,
                        "mouseleave": onLeaveEvent,
                        "mouseenter": onEnterEvent
                    }
                );

            } else {
                list.options.containment.on(
                    {
                        "mousedown": onStartEvent,
                        "mousemove": onMoveEvent,
                        "mouseleave": onLeaveEvent,
                        "mouseenter": onEnterEvent
                    }
                );
                //BALOO - Revised by KESHAV GARG
                //Removed default mousemove and added to list.options.containment above
                /*list.w.on({
                    "mousemove": onMoveEvent
                });*/
            }

            list.w.on('mouseup', onEndEvent);

            //BALOO - Revised by Mohit Kansal
            //IE10 dragging issue - dragging not working properly
            list.w.on('mousemove', "."+list.options.dragClass, onDragElMouseMoveEvent);

            var destroy = function () {
                list.w.off('mouseup', onEndEvent);
                list.w.off('mousemove', "."+list.options.dragClass, onDragElMouseMoveEvent);
            }

            return destroy;

        },

        setScrollParent: function(){
            if(this.scrollParent === null) {
                this.scrollParent = this.placeEl.scrollParent()[0];
            }
        },

        //BALOO - Revised by MOHIT KANSAL
        //Added method getIndex to get the target action index
        getIndex: function(item) {
            var parent = item.parentNode,
                children = parent.children;

            for(var i= 0, length=children.length; i<length; ++i) {
                if(item === children[i])
                    return i;
            }
            return -1;
        },

        serialize: function()
        {
            var data,
                depth = 0,
                list  = this;
                step  = function(level, depth)
                {
                    var array = [ ],
                        items = level.children(list.options.itemNodeName);
                    items.each(function()
                    {
                        var li   = $(this),
                            item = $.extend({}, li.data()),
                            sub  = li.children(list.options.listNodeName);
                        if (sub.length) {
                            item.children = step(sub, depth + 1);
                        }
                        array.push(item);
                    });
                    return array;
                };
            data = step(list.el.find(list.options.listNodeName).first(), depth);
            return data;
        },

        serialise: function()
        {
            return this.serialize();
        },

        reset: function()
        {
            this.mouse = {
                offsetX   : 0,
                offsetY   : 0,
                startX    : 0,
                startY    : 0,
                lastX     : 0,
                lastY     : 0,
                nowX      : 0,
                nowY      : 0,
                distX     : 0,
                distY     : 0,
                dirAx     : 0,
                dirX      : 0,
                dirY      : 0,
                lastDirX  : 0,
                lastDirY  : 0,
                distAxX   : 0,
                distAxY   : 0
            };
            this.isTouch    = false;
            this.moving     = false;
            this.dragEl     = null;
            this.dragRootEl = null;
            this.dragDepth  = 0;
            this.hasNewRoot = false;
            this.pointEl    = null;
        },

        //BALOO - revised by Sakshi Nagpal
        //No need of expand and collapse functionality

        /*expandItem: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action="expand"]').hide();
            li.children('[data-action="collapse"]').show();
            li.children(this.options.listNodeName).show();
        },

        collapseItem: function(li)
        {
            var lists = li.children(this.options.listNodeName);
            if (lists.length) {
                li.addClass(this.options.collapsedClass);
                li.children('[data-action="collapse"]').hide();
                li.children('[data-action="expand"]').show();
                li.children(this.options.listNodeName).hide();
            }
        },

        expandAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.expandItem($(this));
            });
        },

        collapseAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.collapseItem($(this));
            });
        },

        setParent: function(li)
        {
            if (li.children(this.options.listNodeName).length) {
                li.prepend($(this.options.expandBtnHTML));
                li.prepend($(this.options.collapseBtnHTML));
            }
            li.children('[data-action="expand"]').hide();
        },

        unsetParent: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action]').remove();
            li.children(this.options.listNodeName).remove();
        },*/

        dragStart: function(e)
        {
            //BALOO - Revised by Mohit Kansal
            var mouse    = this.mouse,
                target   = $(e.target),
                dragLeftPosition = null,
                dragItem, dragStartIndex;

            mouse.offsetX = e.offsetX !== undefined ? e.offsetX : (e.originalEvent.layerX !== undefined ? e.originalEvent.layerX : e.pageX - target.offset().left);
            mouse.offsetY = e.offsetY !== undefined ? e.offsetY : (e.originalEvent.layerY !== undefined ? e.originalEvent.layerY : e.pageY - target.offset().top);
            mouse.startX = mouse.lastX = e.pageX;
            mouse.startY = mouse.lastY = e.pageY;

            if(this.options.isActionDrag) {
                var method   = target.parents(".method"),
                    actionList = method.find(".actionList");

                dragStartIndex = this.getIndex(target[0].parentNode);

                dragItem = $(actionList.children()[dragStartIndex]);
                dragLeftPosition = dragItem.offset().left;

                //adding 7 px because there is a padding and border on action node
                mouse.offsetY += 7;
            } else if(this.options.isMethodDrag) {
                dragItem = $(target[0].parentNode.parentNode);
                dragLeftPosition = dragItem.offset().left;
                dragStartIndex = this.getIndex(dragItem[0]);

                //adding 7 px because there is a padding and border on action node
                mouse.offsetY += 16;
            } else if(this.options.isStepDrag) {
                dragItem = target.closest(this.options.itemNodeName);
                dragStartIndex = this.getIndex(dragItem[0]);
                dragLeftPosition = dragItem.offset().left;

                //adding 40 px because there is a padding and border on step node
                mouse.offsetY += 40;
            }
            else {
                dragItem = target.closest(this.options.itemNodeName);
                dragStartIndex = this.getIndex(dragItem[0]);
            }

            this.el.trigger('dragStart', [dragStartIndex]);

            this.placeEl.css('height', dragItem.outerHeight());

            this.dragRootEl = this.el;

            this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
            this.dragEl.css('width', dragItem.outerWidth());
            dragItem.after(this.placeEl);
            dragItem[0].parentNode.removeChild(dragItem[0]);

            if(this.options.isActionDrag) {
                dragItem.append(this.options.actionButtonHtml);
            }
            if(this.options.isStepDrag) {
                dragItem.append(this.options.gripperIcon);
            }
            dragItem.appendTo(this.dragEl);

            this.options.$parent.append(this.dragEl);
            this.dragEl.css({
                //BALOO - Revised by Mohit Kansal
                //'left' : e.pageX - mouse.offsetX,
                'left': dragLeftPosition !== null ? dragLeftPosition : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });

            // total depth of dragging item
            var i, depth,
                items = this.dragEl.find(this.options.itemNodeName);
            for (i = 0; i < items.length; i++) {
                depth = $(items[i]).parents(this.options.listNodeName).length;
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }
        },

        dragStop: function(e)
        {
            var el = this.dragEl.children(this.options.itemNodeName).first(),
                placementIndex = this.getIndex(this.placeEl[0]);

            //BALOO - Revised by Mohit Kansal
            if(this.options.isActionDrag) {
                var actionButtonContainer = el.children("." + this.options.actionButtonContainerClass)[0];
                el[0].removeChild(actionButtonContainer);
            }

            //BALOO - Revised by Keshav Garg
            if(this.options.isStepDrag) {
                var gripperIcon = el.children("." + this.options.gripperIconDragClass)[0];
                el[0].removeChild(gripperIcon);
            }

            el[0].parentNode.removeChild(el[0]);
            this.placeEl.replaceWith(el);

            this.dragEl.remove();

            if (this.hasNewRoot) {
                this.el.trigger('change');
                this.dragRootEl.trigger('change', [placementIndex]);
            } else {
                this.el.trigger('change', [placementIndex]);
            }
            this.reset();
        },

        dragMove: function(e)
        {
            var list,
                opt   = this.options,
                mouse = this.mouse;

            this.dragEl.css({
                //BALOO - Revised by Mohit Kansal
                //'left' : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });

            // mouse position last events
            mouse.lastX = mouse.nowX;
            mouse.lastY = mouse.nowY;
            // mouse position this events
            mouse.nowX  = e.pageX;
            mouse.nowY  = e.pageY;
            // distance mouse moved between events
            mouse.distX = mouse.nowX - mouse.lastX;
            mouse.distY = mouse.nowY - mouse.lastY;
            // direction mouse was moving
            mouse.lastDirX = mouse.dirX;
            mouse.lastDirY = mouse.dirY;
            // direction mouse is now moving (on both axis)
            mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
            mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
            // axis mouse is now moving on
            var newAx   = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

            // do nothing on first move
            if (!mouse.moving) {
                mouse.dirAx  = newAx;
                mouse.moving = true;
                return;
            }

            //Do scrolling
            if (opt.scroll) {
                var scrolled = false;
                this.setScrollParent();
                var scrollParent = this.scrollParent;

                if(scrollParent != document && scrollParent.tagName != 'HTML') {
                    if((opt.scrollTriggers.bottom + scrollParent.offsetHeight) - (e.pageY - scrollParent.offsetTop) < opt.scrollSensitivity)
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop + opt.scrollSpeed;
                    else if(e.pageY - scrollParent.offsetTop - opt.scrollTriggers.top < opt.scrollSensitivity)
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop - opt.scrollSpeed;

                    if((opt.scrollTriggers.right + scrollParent.offsetWidth) - (e.pageX - scrollParent.offsetLeft) < opt.scrollSensitivity)
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + opt.scrollSpeed;
                    else if(e.pageX - scrollParent.offsetLeft - opt.scrollTriggers.left < opt.scrollSensitivity)
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - opt.scrollSpeed;
                } else {
                    if(e.pageY - $(document).scrollTop() - opt.scrollTriggers.top < opt.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() - opt.scrollSpeed);
                    else if( (opt.scrollTriggers.bottom + $(window).height()) - (e.pageY - $(document).scrollTop()) < opt.scrollSensitivity)
                        scrolled = $(document).scrollTop($(document).scrollTop() + opt.scrollSpeed);

                    if(e.pageX - $(document).scrollLeft() - opt.scrollTriggers.left < opt.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - opt.scrollSpeed);
                    else if(opt.scrollTriggers.right + $(window).width() - (e.pageX - $(document).scrollLeft()) < opt.scrollSensitivity)
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + opt.scrollSpeed);
                }
            }

            if (this.scrollTimer)
                clearTimeout(this.scrollTimer);
            if (opt.scroll && scrolled) {
                this.scrollTimer = setTimeout(function() {
                    $(window).trigger(e);
                }, opt.scrollInterval);
            }

            // calc distance moved on this axis (and direction)
            if (mouse.dirAx !== newAx) {
                mouse.distAxX = 0;
                mouse.distAxY = 0;
            } else {
                mouse.distAxX += Math.abs(mouse.distX);
                if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
                    mouse.distAxX = 0;
                }
                mouse.distAxY += Math.abs(mouse.distY);
                if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
                    mouse.distAxY = 0;
                }
            }
            mouse.dirAx = newAx;

            /**
             * move horizontal
             */
            //BALOO - revised by Sakshi Nagpal
            //No need of nesting functionality

                /*if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
                // reset move distance on x-axis for new phase
                mouse.distAxX = 0;
                prev = this.placeEl.prev(opt.itemNodeName);
                // increase horizontal level if previous sibling exists and is not collapsed
                if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
                    // cannot increase level when item above is collapsed
                    list = prev.find(opt.listNodeName).last();
                    // check if depth limit has reached
                    depth = this.placeEl.parents(opt.listNodeName).length;
                    if (depth + this.dragDepth <= opt.maxDepth) {
                        // create new sub-level if one doesn't exist
                        if (!list.length) {
                            list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                            list.append(this.placeEl);
                            prev.append(list);
                            this.setParent(prev);
                        } else {
                            // else append to next level up
                            list = prev.children(opt.listNodeName).last();
                            list.append(this.placeEl);
                        }
                    }
                }
                // decrease horizontal level
                if (mouse.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    next = this.placeEl.next(opt.itemNodeName);
                    if (!next.length) {
                        parent = this.placeEl.parent();
                        this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
                        if (!parent.children().length) {
                            this.unsetParent(parent.parent());
                        }
                    }
                }
            }*/

            var isEmpty = false;

            // find list item under cursor
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'hidden';
            }
            this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));

            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'visible';
            }
            if (this.pointEl.hasClass(opt.handleClass)) {
                this.pointEl = this.pointEl.parent(opt.itemNodeName);
            }
            if (this.pointEl.hasClass(opt.emptyClass)) {
                isEmpty = true;
            }
            else if(this.pointEl.hasClass(opt.placeClass)) {
                this.pointEl.closest("." + opt.itemClass);

            }

            if (!this.pointEl.length) {
                return;
            }

            // find parent list of item under cursor
            var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
                isNewRoot   = this.dragRootEl.data('movable-id') !== pointElRoot.data('movable-id');

            /**
             * move vertical
             */
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                // check if groups match if dragging over new root
                if (isNewRoot && opt.group !== pointElRoot.data('movable-group')) {
                    return;
                }

                //BALOO- revised by Sakshi Nagpal
                //Nesting not needed
                /*// check depth limit
                depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
                if (depth > opt.maxDepth) {
                    return;
                }*/
                var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);

                // if empty create new list to replace empty placeholder
                if (isEmpty) {
                    list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
                    list.append(this.placeEl);
                    this.pointEl.replaceWith(list);
                }
                else if (before) {
                    this.pointEl.closest("."+ this.options.itemClass).before(this.placeEl);
                }
                else {
                    this.pointEl.closest("."+ this.options.itemClass).after(this.placeEl);
                }

                //BALOO- revised by Sakshi Nagpal
                //Nesting not needed
                /*if (!parent.children().length) {
                    this.unsetParent(parent.parent());
                }*/
                if (!this.dragRootEl.find(opt.itemNodeName).length) {
                    this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');

                }
                // parent root list has changed
                if (isNewRoot) {
                    this.dragRootEl = pointElRoot;
                    this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
                }
            }
        }

    };

    $.fn.movable = function(params)
    {
        var lists  = this,
            retval = this;

        lists.each(function()
        {
            var plugin = $(this).data("movable");

            if (!plugin) {
                var plugin = new Plugin(this, params);
                var destory = plugin.init();
                $(this).data("movable", plugin);
                $(this).data("movable-destroy", destory);
                $(this).data("movable-id", new Date().getTime());
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };

    //Baloo - revised by Mohit Kansal
    //added the method to get the first ancestor which is scrollable.
    //the method is present in jQueri UI
    $.fn.scrollParent = function() {
        var overflowRegex = /(auto|scroll)/,
            position = this.css( "position" ),
            excludeStaticParent = position === "absolute",
            scrollParent = this.parents().filter( function() {
                var parent = $( this );
                if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                    return false;
                }
                return (overflowRegex).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
            }).eq( 0 );

        return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
    };

})(window.jQuery || window.Zepto, window, document);
