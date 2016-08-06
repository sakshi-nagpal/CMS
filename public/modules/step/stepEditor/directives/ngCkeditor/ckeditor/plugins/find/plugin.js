/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.plugins.add( 'find', {

	// jscs:disable maximumLineLength
	lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
	// jscs:enable maximumLineLength

	init: function( editor ) {

        var isReplace;

        function findEvaluator( node ) {
            return node.type == CKEDITOR.NODE_TEXT && node.getLength() > 0 && ( !isReplace || !node.isReadOnly() );
        }

        // Elements which break characters been considered as sequence.
        function nonCharactersBoundary( node ) {
            return !( node.type == CKEDITOR.NODE_ELEMENT && node.isBlockBoundary( CKEDITOR.tools.extend( {}, CKEDITOR.dtd.$empty, CKEDITOR.dtd.$nonEditable ) ) );
        }

        // Get the cursor object which represent both current character and it's dom
        // position thing.
        var cursorStep = function() {
            return {
                textNode: this.textNode,
                offset: this.offset,
                character: this.textNode ? this.textNode.getText().charAt( this.offset ) : null,
                hitMatchBoundary: this._.matchBoundary
            };
        };

        function getFinder(editor) {
            // Style object for highlights: (#5018)
            // 1. Defined as full match style to avoid compromising ordinary text color styles.
            // 2. Must be apply onto inner-most text to avoid conflicting with ordinary text color styles visually.
            var highlightConfig = {
                    attributes: {
                        'data-cke-highlight': 1
                    },
                    fullMatch: 1,
                    ignoreReadonly: 1,
                    childRule: function() {
                        return 0;
                    }
                },
                highlightAllConfig = {
                    attributes: {
                        'data-cke-highlight': 2
                    },
                    fullMatch: 1,
                    ignoreReadonly: 1,
                    childRule: function() {
                        return 0;
                    }
                };

            var highlightStyle = new CKEDITOR.style( CKEDITOR.tools.extend( highlightConfig, CKEDITOR.config.find_highlight, true )),
                highlightAllStyle = new CKEDITOR.style( CKEDITOR.tools.extend( highlightAllConfig, CKEDITOR.config.find_highlight_all, true ));

            //BALOO - Revised by Mohit Kansal. Added two variables to set the range
            var lastEditor = null, firstEditor = null;

            // Iterator which walk through the specified range char by char. By
            // default the walking will not stop at the character boundaries, until
            // the end of the range is encountered.
            // @param { CKEDITOR.dom.range } range
            // @param {Boolean} matchWord Whether the walking will stop at character boundary.
            function characterWalker( range, matchWord ) {
                var self = this;
                var walker = new CKEDITOR.dom.walker( range );
                walker.guard = matchWord ? nonCharactersBoundary : function( node ) {
                    !nonCharactersBoundary( node ) && ( self._.matchBoundary = true );
                };
                walker.evaluator = findEvaluator;
                walker.breakOnFalse = 1;

                if ( range.startContainer.type == CKEDITOR.NODE_TEXT ) {
                    this.textNode = range.startContainer;
                    this.offset = range.startOffset - 1;
                }

                this._ = {
                    matchWord: matchWord,
                    walker: walker,
                    matchBoundary: false
                };
            }

            characterWalker.prototype = {
                next: function() {
                    return this.move();
                },

                back: function() {
                    return this.move( true );
                },

                move: function( rtl ) {
                    var currentTextNode = this.textNode;
                    // Already at the end of document, no more character available.
                    if ( currentTextNode === null )
                        return cursorStep.call( this );

                    this._.matchBoundary = false;

                    // There are more characters in the text node, step forward.
                    if ( currentTextNode && rtl && this.offset > 0 ) {
                        this.offset--;
                        return cursorStep.call( this );
                    } else if ( currentTextNode && this.offset < currentTextNode.getLength() - 1 ) {
                        this.offset++;
                        return cursorStep.call( this );
                    } else {
                        currentTextNode = null;
                        // At the end of the text node, walking foward for the next.
                        while ( !currentTextNode ) {
                            currentTextNode = this._.walker[ rtl ? 'previous' : 'next' ].call( this._.walker );

                            // Stop searching if we're need full word match OR
                            // already reach document end.
                            if ( this._.matchWord && !currentTextNode || this._.walker._.end )
                                break;
                        }
                        // Found a fresh text node.
                        this.textNode = currentTextNode;
                        if ( currentTextNode )
                            this.offset = rtl ? currentTextNode.getLength() - 1 : 0;
                        else
                            this.offset = 0;
                    }

                    return cursorStep.call( this );
                }

            };

            /**
             * A range of cursors which represent a trunk of characters which try to
             * match, it has the same length as the pattern  string.
             *
             * **Note:** This class isn't accessible from global scope.
             *
             * @private
             * @class CKEDITOR.plugins.find.characterRange
             * @constructor Creates a characterRange class instance.
             */
            var characterRange = function( characterWalker, rangeLength ) {
                this._ = {
                    walker: characterWalker,
                    cursors: [],
                    rangeLength: rangeLength,
                    highlightRange: null,
                    isMatched: 0
                };
            };

            characterRange.prototype = {
                /**
                 * Translate this range to {@link CKEDITOR.dom.range}.
                 */
                toDomRange: function() {
                    //BALOO - Revised by Mohit Kansal
                    var range = lastEditor.createRange();
                    var cursors = this._.cursors;
                    if ( cursors.length < 1 ) {
                        var textNode = this._.walker.textNode;
                        if ( textNode )
                            range.setStartAfter( textNode );
                        else
                            return null;
                    } else {
                        var first = cursors[ 0 ],
                            last = cursors[ cursors.length - 1 ];

                        range.setStart( first.textNode, first.offset );
                        range.setEnd( last.textNode, last.offset + 1 );
                    }

                    return range;
                },

                /**
                 * Reflect the latest changes from dom range.
                 */
                updateFromDomRange: function( domRange ) {
                    var cursor,
                        walker = new characterWalker( domRange );
                    this._.cursors = [];
                    do {
                        cursor = walker.next();
                        if ( cursor.character ) this._.cursors.push( cursor );
                    }
                    while ( cursor.character );
                    this._.rangeLength = this._.cursors.length;
                },

                setMatched: function() {
                    this._.isMatched = true;
                },

                clearMatched: function() {
                    this._.isMatched = false;
                },

                isMatched: function() {
                    return this._.isMatched;
                },

                /**
                 * Hightlight all the matched occurences.
                 */
                addToHighlight: function() {
                    // Do not apply if nothing is found.
                    if ( this._.cursors.length < 1 )
                        return;

                    var range = this.addHighlightStyle(highlightAllStyle);

                    // Update the character cursors.
                    this.updateFromDomRange( range );
                },

                /**
                 * Hightlight the current matched chunk of text.
                 */
                highlight: function() {
                    // Do not apply if nothing is found.
                    if ( this._.cursors.length < 1 )
                        return;

                    // Remove the previous highlight if there's one.
                    if ( this._.highlightRange )
                        this.removeHighlight();

                    var range = this.addHighlightStyle(highlightStyle);

                    // Scroll the editor to the highlighted area.
                    var element = range.startContainer;
                    if ( element.type != CKEDITOR.NODE_ELEMENT )
                        element = element.getParent();
                    element.scrollIntoView(false);

                    // Update the character cursors.
                    this.updateFromDomRange( range );
                },

                /**
                 * Remove highlighted find result.
                 */
                removeHighlight: function() {
                    this.removeHighlightStyle(highlightStyle);
                },

                removeHighlightAll: function() {
                    this.removeHighlightStyle(highlightAllStyle);
                },

                addHighlightStyle: function(highlightStyle) {
                    // Apply the highlight.
                    var range = this.toDomRange(),
                        bookmark = range.createBookmark();
                    highlightStyle.applyToRange( range, editor );
                    range.moveToBookmark( bookmark );
                    this._.highlightRange = range;

                    return range;
                },

                removeHighlightStyle: function(highlightStyle) {
                    if ( !this._.highlightRange )
                        return;

                    var bookmark = this._.highlightRange.createBookmark();
                    highlightStyle.removeFromRange( this._.highlightRange, editor );
                    this._.highlightRange.moveToBookmark( bookmark );
                    this.updateFromDomRange( this._.highlightRange );
                    //this._.highlightRange = null;
                },

                isReadOnly: function() {
                    /*if ( !this._.highlightRange )
                        return 0;

                    return this._.highlightRange.startContainer.isReadOnly();*/

                    if(this) {
                        return this.toDomRange().startContainer.isReadOnly();
                    }

                    return 0;
                },

                moveBack: function() {
                    var retval = this._.walker.back(),
                        cursors = this._.cursors;

                    if ( retval.hitMatchBoundary )
                        this._.cursors = cursors = [];

                    cursors.unshift( retval );
                    if ( cursors.length > this._.rangeLength )
                        cursors.pop();

                    return retval;
                },

                moveNext: function() {
                    var retval = this._.walker.next(),
                        cursors = this._.cursors;

                    // Clear the cursors queue if we've crossed a match boundary.
                    if ( retval.hitMatchBoundary )
                        this._.cursors = cursors = [];

                    cursors.push( retval );
                    if ( cursors.length > this._.rangeLength )
                        cursors.shift();

                    return retval;
                },

                getEndCharacter: function() {
                    var cursors = this._.cursors;
                    if ( cursors.length < 1 )
                        return null;

                    return cursors[ cursors.length - 1 ].character;
                },

                getFirstCharacter: function() {
                    var cursors = this._.cursors;
                    if ( cursors.length < 1 )
                        return null;

                    return cursors[ 0 ].character;
                },

                getNextCharacterRange: function( maxLength ) {
                    var lastCursor, nextRangeWalker,
                        cursors = this._.cursors;

                    if ( ( lastCursor = cursors[ cursors.length - 1 ] ) && lastCursor.textNode )
                        nextRangeWalker = new characterWalker( getRangeAfterCursor( lastCursor ) );
                    // In case it's an empty range (no cursors), figure out next range from walker (#4951).
                    else
                        nextRangeWalker = this._.walker;

                    return new characterRange( nextRangeWalker, maxLength );
                },

                getCursors: function() {
                    return this._.cursors;
                }
            };


            // The remaining document range after the character cursor.
            function getRangeAfterCursor( cursor, inclusive ) {
                //BALOO - Revised by Mohit Kansal
                var range = lastEditor.createRange();
                range.setStart( cursor.textNode, ( inclusive ? cursor.offset : cursor.offset + 1 ) );
                range.setEndAt( lastEditor.editable(), CKEDITOR.POSITION_BEFORE_END );
                return range;
            }

            // The document range before the character cursor.
            function getRangeBeforeCursor( cursor ) {
                //BALOO - Revised by Mohit Kansal
                var range = lastEditor.createRange();
                range.setStartAt( firstEditor.editable(), CKEDITOR.POSITION_AFTER_START );
                range.setEnd( cursor.textNode, cursor.offset );
                return range;
            }

            var KMP_NOMATCH = 0,
                KMP_ADVANCED = 1,
                KMP_MATCHED = 2;

            // Examination the occurrence of a word which implement KMP algorithm.
            var kmpMatcher = function( pattern, ignoreCase ) {
                var overlap = [ -1 ];
                if ( ignoreCase )
                    pattern = pattern.toLowerCase();
                for ( var i = 0; i < pattern.length; i++ ) {
                    overlap.push( overlap[ i ] + 1 );
                    while ( overlap[ i + 1 ] > 0 && pattern.charAt( i ) != pattern.charAt( overlap[ i + 1 ] - 1 ) )
                        overlap[ i + 1 ] = overlap[ overlap[ i + 1 ] - 1 ] + 1;
                }

                this._ = {
                    overlap: overlap,
                    state: 0,
                    ignoreCase: !!ignoreCase,
                    pattern: pattern
                };
            };

            kmpMatcher.prototype = {
                feedNextCharacter: function( c ) {
                    if ( this._.ignoreCase )
                        c = c.toLowerCase();

                    while ( true ) {
                        if ( c == this._.pattern.charAt( this._.state ) ) {
                            this._.state++;
                            if ( this._.state == this._.pattern.length ) {
							    this._.state = 0;
                                return KMP_MATCHED;
                            }
                            return KMP_ADVANCED;
                        } else if ( !this._.state ) {
                            return KMP_NOMATCH;
                        }
                        else {
                            this._.state = this._.overlap[this._.state];
                        }
                    }

                    return null;
                },

                feedPreviousCharacter: function( c ) {
                    if ( this._.ignoreCase )
                        c = c.toLowerCase();

                    while ( true ) {
                        if ( c == this._.pattern.charAt( this._.state ) ) {
                            this._.state--;
                            if ( this._.state == -1 ) {
                                this.resetPrevious();
                                return KMP_MATCHED;
                            }
                            return KMP_ADVANCED;
                        } else if ( this._.state ==  this._.pattern.length - 1 || !this._.state) {
                            this.resetPrevious();
                            return KMP_NOMATCH;
                        }
                        else {
                            this._.state = this._.overlap[this._.state];
                        }
                    }

                    return null;
                },

                resetNext: function() {
                    this._.state = 0;
                },

                resetPrevious: function() {
                    this._.state = this._.pattern.length - 1;
                }
            };

            var wordSeparatorRegex = /[.,"'?!;: \u0085\u00a0\u1680\u280e\u2028\u2029\u202f\u205f\u3000]/;

            var isWordSeparator = function( c ) {
                if ( !c )
                    return true;
                var code = c.charCodeAt( 0 );
                return ( code >= 9 && code <= 0xd ) || ( code >= 0x2000 && code <= 0x200a ) || wordSeparatorRegex.test( c );
            };

            var finder = {
                searchRange: null,
                matchRange: null,
                findCounter: 0,
                //highlightedOccurrences: [],
                findPrevious: function(pattern, matchCase, matchWord, matchCyclic, highlightMatched, cyclicRerun) {
                    if ( !this.matchRange )
                        this.matchRange = new characterRange( new characterWalker( this.searchRange ), pattern.length );
                    else {
                        this.matchRange.removeHighlight();
                        this.matchRange = this.matchRange.getNextCharacterRange( pattern.length );
                    }

                    var matcher = new kmpMatcher( pattern, !matchCase ),
                        matchState = KMP_NOMATCH,
                        character = '%',
                        currentHighlighted = true;

                    while ( character !== null ) {
                        this.matchRange.moveBack();
                        matcher.resetPrevious();

                        while ( ( character = this.matchRange.getFirstCharacter() ) ) {
                            matchState = matcher.feedPreviousCharacter( character );
                            if ( matchState == KMP_MATCHED && currentHighlighted ) {
                                if(currentHighlighted) {
                                    currentHighlighted = false;
                                    matchState = KMP_NOMATCH;
                                } else {
                                    break;
                                }
                            }
                            if ( this.matchRange.moveBack().hitMatchBoundary ) {
                                matcher.resetPrevious();
                            }
                        }

                        if ( matchState == KMP_MATCHED ) {
                            if ( matchWord ) {
                                var cursors = this.matchRange.getCursors(),
                                    tail = cursors[ cursors.length - 1 ],
                                    head = cursors[ 0 ];

                                var rangeBefore = getRangeBeforeCursor( head ),
                                    rangeAfter = getRangeAfterCursor( tail );

                                // The word boundary checks requires to trim the text nodes. (#9036)
                                rangeBefore.trim();
                                rangeAfter.trim();

                                var headWalker = new characterWalker( rangeBefore, true ),
                                    tailWalker = new characterWalker( rangeAfter, true );

                                if ( !( isWordSeparator( headWalker.back().character ) && isWordSeparator( tailWalker.next().character ) ) )
                                    continue;
                            }
                            this.matchRange.setMatched();
                            if ( highlightMatched !== false )
                                this.matchRange.highlight();
                            return true;
                        }
                    }

                    this.matchRange.clearMatched();
                    this.matchRange.removeHighlight();
                    // Clear current session and restart with the default search
                    // range.
                    // Re-run the finding once for cyclic.(#3517)
                    if ( matchCyclic && !cyclicRerun ) {
                        this.searchRange = getSearchRange( 1 );
                        this.matchRange = null;
                        return arguments.callee.apply( this, Array.prototype.slice.call( arguments ).concat( [ true ] ) );
                    }

                    return false;
                },

                findNext: function( pattern, matchCase, matchWord, matchCyclic, highlightMatched, cyclicRerun ) {
                    if ( !this.matchRange )
                        this.matchRange = new characterRange( new characterWalker( this.searchRange ), pattern.length );
                    else {
                        if ( highlightMatched !== false )
                            this.matchRange.removeHighlight();
                        this.matchRange = this.matchRange.getNextCharacterRange( pattern.length );
                    }

                    var matcher = new kmpMatcher( pattern, !matchCase ),
                        matchState = KMP_NOMATCH,
                        character = '%';

                    while ( character !== null ) {
                        this.matchRange.moveNext();

                        while ( ( character = this.matchRange.getEndCharacter() ) ) {
                            matchState = matcher.feedNextCharacter( character );
                            if ( matchState == KMP_MATCHED )
                                break;
                            if ( this.matchRange.moveNext().hitMatchBoundary )
                                matcher.resetNext();
                        }

                        if ( matchState == KMP_MATCHED ) {
                            //BALOO - Revised by MOHIT KANSAL
                            if(this.matchRange.isReadOnly()) {
                                continue;
                            }

                            if ( matchWord ) {
                                var cursors = this.matchRange.getCursors(),
                                    tail = cursors[ cursors.length - 1 ],
                                    head = cursors[ 0 ];

                                var rangeBefore = getRangeBeforeCursor( head ),
                                    rangeAfter = getRangeAfterCursor( tail );

                                // The word boundary checks requires to trim the text nodes. (#9036)
                                rangeBefore.trim();
                                rangeAfter.trim();

                                var headWalker = new characterWalker( rangeBefore, true ),
                                    tailWalker = new characterWalker( rangeAfter, true );

                                if ( !( isWordSeparator( headWalker.back().character ) && isWordSeparator( tailWalker.next().character ) ) )
                                    continue;
                            }
                            this.matchRange.setMatched();
                            if ( highlightMatched !== false )
                                this.matchRange.highlight();
                            return true;
                        }
                    }

                    this.matchRange.clearMatched();
                    this.matchRange.removeHighlight();
                    // Clear current session and restart with the default search
                    // range.
                    // Re-run the finding once for cyclic.(#3517)
                    if ( matchCyclic && !cyclicRerun ) {
                        this.searchRange = getSearchRange( 1 );
                        this.matchRange = null;
                        return arguments.callee.apply( this, Array.prototype.slice.call( arguments ).concat( [ true ] ) );
                    }

                    return false;
                },

                // Record how much replacement occurred toward one replacing.
                replaceCounter: 0,

                replace: function( pattern, newString, matchCase, matchWord, matchCyclic, isReplaceAll ) {
                    isReplace = 1;

                    // Successiveness of current replace/find.
                    var result = 0;

                    // 1. Perform the replace when there's already a match here.
                    // 2. Otherwise perform the find but don't replace it immediately.
                    if ( this.matchRange && this.matchRange.isMatched() && !this.matchRange._.isReplaced && !this.matchRange.isReadOnly() ) {
                        // Turn off highlight for a while when saving snapshots.
                        this.matchRange.removeHighlight();

                        var domRange = this.matchRange.toDomRange();
                        var text = editor.document.createText( newString );

                        domRange.deleteContents();
                        domRange.insertNode( text );

                        this.matchRange.updateFromDomRange( domRange );

                        var currentEditor = getEditorFromDOMRange(domRange);
                        if(currentEditor) {
                            currentEditor.fire("change");
                        }

                        //BALOO - Revisied by MOHIT KANSAL
                        if ( !isReplaceAll ) {
                            //this.matchRange.highlight();
                            this.matchRange.removeHighlightAll();
                            //find next occurence
                            this.findNext( pattern, matchCase, matchWord, matchCyclic, !isReplaceAll );

                            //currentEditor.fire( 'saveSnapshot' );
                        } else {
                            this.matchRange._.isReplaced = true;
                        }

                        var occurances = (newString.match(new RegExp(pattern, 'g')) || []).length;
                        this.findCounter += occurances;

                        this.replaceCounter++;
                        result = 1;
                    } else {
                        result = this.findNext( pattern, matchCase, matchWord, matchCyclic, !isReplaceAll );
                    }

                    isReplace = 0;

                    return result;
                },

                removeAllHighlights: function() {
                    if(finder.findCounter) {
                        $("span[data-cke-highlight='2']").contents().unwrap();
                        finder.findCounter = 0;
                    }

                    finder.replaceCounter = 0;
                }
            };

            //BALOO - Revised by Mohit Kansal
            function setEditors() {
                var inlineEditors = editor.config.$editorContainer.find(".cke_editable.cke_editable_inline"),
                    firstEditorElement = inlineEditors[0],
                    lastEditorElement = inlineEditors[inlineEditors.length - 1],
                    editorInstances = CKEDITOR.instances;

                firstEditor = lastEditor = null;

                for(var instanceKey in editorInstances) {
                    if(!firstEditor && editorInstances[instanceKey].element.$ === firstEditorElement) {
                        firstEditor = editorInstances[instanceKey];

                        if(firstEditor && lastEditor)
                            break;
                    }

                    if(!lastEditor && editorInstances[instanceKey].element.$ === lastEditorElement) {
                        lastEditor = editorInstances[instanceKey];

                        if(firstEditor && lastEditor)
                            break;
                    }
                }
            }

            // The range in which find/replace happened, receive from user
            // selection prior.
            function getSearchRange() {
                if(editor.config.$editorContainer) {
                    setEditors();
                } else {
                    firstEditor = editor;
                    lastEditor = editor;
                }

                var firstEditable = firstEditor.editable(),
                    lastEditable = lastEditor.editable(),
                    searchRange = lastEditor.createRange();

                searchRange.setStartAt( firstEditable, CKEDITOR.POSITION_AFTER_START );
                searchRange.setEndAt( lastEditable, CKEDITOR.POSITION_BEFORE_END );

                return searchRange;
            }

            function getEditorFromDOMRange(domRange) {
                var editorDiv = domRange.startContainer.getAscendant("div",true);
                if(editorDiv) {
                    return editorDiv.getEditor();
                }
                return null;
            }

            function saveSnapshotForAllEditors() {
                /*var instances = CKEDITOR.instances;

                for(var instanceKey in instances) {
                    instances[instanceKey].fire('saveSnapshot');
                }*/
            }

            /*function getSearchRange( isDefault ) {
                var searchRange,
                    sel = editor.getSelection(),
                    editable = editor.editable();

                if ( sel && !isDefault ) {
                    searchRange = sel.getRanges()[ 0 ].clone();
                    searchRange.collapse( true );
                } else {
                    searchRange = editor.createRange();
                    searchRange.setStartAt( editable, CKEDITOR.POSITION_AFTER_START );
                }
                searchRange.setEndAt( editable, CKEDITOR.POSITION_BEFORE_END );

                return searchRange;
            }*/

            var lang = editor.lang.find;
            return {
                findNext: function(data) {
                    if ( !finder.findNext (
                        data.findPattern,
                        data.matchCase,
                        data.findWord,
                        //data.findCyclic
                        true
                    ) ) {
                        data.callback(lang.notFoundMsg);
                        //alert( lang.notFoundMsg ); // jshint ignore:line
                    }/* else {
                        data.callback();
                    }*/
                },

                findPrevious: function(data) {
                    if ( !finder.findPrevious(
                        data.findPattern,
                        data.matchCase,
                        data.findWord,
                        //data.findCyclic
                        true
                    ) ) {
                        data.callback(lang.notFoundMsg);
                        //alert( lang.notFoundMsg ); // jshint ignore:line
                    }/* else {
                        data.callback();
                    }*/
                },

                replace: function(data) {
                    if ( !finder.replace(
                        data.findPattern,
                        data.replaceText,
                        data.matchCase,
                        data.findWord,
                        //data.findCyclic
                        true
                    ) ) {
                        data.callback(lang.notFoundMsg);
                        //alert( lang.notFoundMsg ); // jshint ignore:line
                    } else {
                        data.callback(lang.findSuccessMsg.replace( /%1/, finder.findCounter - finder.replaceCounter ));
                    }
                },

                findAll: function(data) {
                    // create the search range
                    finder.searchRange = getSearchRange();
                    if ( finder.matchRange ) {
                        finder.matchRange.removeHighlight();
                        finder.matchRange = null;
                    }

                    finder.removeAllHighlights();

                    while ( finder.findNext(
                        data.findPattern,
                        data.matchCase,
                        data.findWord,
                        false,
                        false
                    ) ) {
                        //finder.highlightedOccurrences.push(finder.matchRange);
                        finder.matchRange.addToHighlight();
                        ++finder.findCounter;
                    }

                    if ( finder.findCounter ) {
                        data.callback(lang.findSuccessMsg.replace( /%1/, finder.findCounter ));
                        //alert( lang.replaceSuccessMsg.replace( /%1/, finder.replaceCounter ) ); // jshint ignore:line
                    } else {
                        data.callback(lang.notFoundMsg);
                        //alert( lang.notFoundMsg ); // jshint ignore:line
                    }
                },

                replaceAll: function(data) {
                    finder.replaceCounter = 0;

                    // create the search range
                    finder.searchRange = getSearchRange();
                    if ( finder.matchRange ) {
                        finder.matchRange.removeHighlight();
                        finder.matchRange = null;
                    }

                    //editor.fire( 'saveSnapshot' );

                    while ( finder.replace(
                        data.findPattern,
                        data.replaceText,
                        data.matchCase,
                        data.findWord,
                        false,
                        true
                    ) ) {

                    }

                    var replaceCounter = finder.replaceCounter;
                    finder.removeAllHighlights();

                    if ( replaceCounter ) {
                        data.callback(lang.replaceSuccessMsg.replace( /%1/, replaceCounter ));
                        //alert( lang.replaceSuccessMsg.replace( /%1/, finder.replaceCounter ) ); // jshint ignore:line
                        saveSnapshotForAllEditors();
                        //editor.fire( 'saveSnapshot' );
                    } else {
                        data.callback(lang.notFoundMsg);
                        //alert( lang.notFoundMsg ); // jshint ignore:line
                    }
                },

                onHide: function() {
                    var range;
                    if ( finder.matchRange && finder.matchRange.isMatched() ) {
                        finder.matchRange.removeHighlight();

                        range = finder.matchRange.toDomRange();
                        if ( range )
                            editor.getSelection().selectRanges( [ range ] );
                    }

                    //un-highlight all the highlighted terms
                    finder.removeAllHighlights();

                    // Clear current session before find close
                    delete finder.matchRange;
                },

                onShow: function() {
                    // create the search range
                    finder.searchRange = getSearchRange();
                    saveSnapshotForAllEditors();
                }
            };
        }

        var finderObject = getFinder(editor);

		editor.addCommand( 'findNext', {
            canUndo: false,
            readOnly: 1,
            editorFocus: false,

            exec: function(editor, data) {
                finderObject.findNext(data);
            }
        });

        editor.addCommand( 'findPrevious', {
            canUndo: false,
            readOnly: 1,
            editorFocus: false,

            exec: function(editor, data) {
                finderObject.findPrevious(data);
            }
        });

        editor.addCommand( 'findAll', {
            canUndo: false,
            readOnly: 1,
            editorFocus: false,

            exec: function(editor, data) {
                finderObject.findAll(data);
            }
        });

		editor.addCommand( 'replace', {
            canUndo: false,
            editorFocus: false,

            exec: function(editor, data) {
                finderObject.replace(data);
            }
        });

        editor.addCommand( 'replaceAll', {
            canUndo: false,
            editorFocus: false,

            exec: function(editor, data) {
                finderObject.replaceAll(data);
            }
        });

        editor.addCommand( 'createSearchRange', {
            canUndo: false,
            editorFocus: false,

            exec: function() {
                finderObject.onShow();
            }
        });

        editor.addCommand( 'removeSearchRange', {
            canUndo: false,
            editorFocus: false,

            exec: function() {
                finderObject.onHide();
            }
        });
	}
} );

/**
 * Defines the style to be used to highlight results with the find plugin.
 *
 *		// Highlight search results with blue on yellow.
 *		config.find_highlight = {
 *			element: 'span',
 *			styles: { 'background-color': '#ff0', color: '#00f' }
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.find_highlight = { element: 'span', styles: {'background-color': '#FF9632'} };
CKEDITOR.config.find_highlight_all = { element: 'span', styles: {'background-color': '#fdd892'} };
