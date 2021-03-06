/****************************************************************************
    jquery-bootstrap.js,

    (c) 2017, FCOO

    https://github.com/fcoo/jquery-bootstrap
    https://github.com/fcoo

****************************************************************************/

(function ($, i18next, window, document, undefined) {
    "use strict";

    /*

    Almost all elements comes in two sizes: normal and small set by options.small: false/true

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Elements to click or touch has a special implementation:
    For device with 'touch' the Bootstrap size 'normal' and 'small' are used
    For desktop (only mouse) we using smaller version (large = Bootstrap normal, normal = Bootstrap small, small = Bootstrap x-small)

    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
    var ns = window;

    /*
    Create $.BSASMODAL = record with {className: asModal-function} where className is added to any $element that have a asModal-function
    Ex.:
    $.BSASMODAL['BSTABLE'] = function(){ //Create bsModal for this }
    var myTable = $.bsTable({...}); //Add 'BSTABLE' to class-name for  result
    myTable.asModal({...});
    */
    $.BSASMODAL = $.BSASMODAL || {};
    $.fn.asModal = function(options){
        var _this   = this,
            asModal = null;

        $.each($.BSASMODAL, function(id, asModalFunc){
            if (_this.hasClass(id)){
                asModal = asModalFunc;
                return false;
            }
        });
        return asModal ? $.proxy(asModal, this)( options ) : null;
    };


    ns.bsIsTouch = true;

    $.EMPTY_TEXT = '___***EMPTY***___';

    //FONTAWESOME_PREFIX = the classname-prefix used when non is given. Fontawesome 4.X: 'fa', Fontawesome 5: Free: 'fas' Pro: 'far' or 'fal'
    $.FONTAWESOME_PREFIX = $.FONTAWESOME_PREFIX || 'fa';

    //ICONFONT_PREFIXES = STRING or []STRING with regexp to match class-name setting font-icon class-name. Fontawesome 5: 'fa.?' accepts 'fas', 'far', etc. as class-names => will not add $.FONTAWESOME_PREFIX
    $.ICONFONT_PREFIXES = 'fa.?';

    /******************************************************
    $divXXGroup
    ******************************************************/
    function $divXXGroup( groupTypeClass, options ){
        return $('<div/>')
                   ._bsAddBaseClassAndSize( $.extend({}, options, {
                       baseClass   : groupTypeClass,
                       useTouchSize: true
                   }));
    }

    //$._bsAdjustIconAndText: Adjust options to fit with {icon"...", text:{da:"", en:".."}
    // options == {da:"..", en:".."} => return {text: options}
    // options == array of ??        => array of $._bsAdjustIconAndText( ??? )
    // options == STRING             => return {text: options}

    $._bsAdjustIconAndText = function( options ){
        if (!options)
            return options;
        if ($.isArray( options )){
            var result = [];
            $.each( options, function(index, content){
                result.push( $._bsAdjustIconAndText(content) );
            });
            return result;
        }

        if ($.type( options ) == "object"){
            if (!options.icon && !options.text)
                return {text: options };
            else
                return options;
        }
        else
            //options == simple type (string, number etc.)
            return {text: options };

    };

    //$._bsAdjustText: Adjust options to fit with {da:"...", en:"..."}
    // options == {da:"..", en:".."} => return options
    // options == STRING             => return {da: options}
    $._bsAdjustText = function( options ){
        if (!options)
            return options;
        if ($.type( options ) == "string")
            return {da: options, en:options};
        return options;
    };

    //$._bsAdjustOptions: Adjust options to allow text/name/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        //*********************************************************************
        //adjustContentOptions: Adjust options for the content of elements
        function adjustContentAndContextOptions( options, context ){
            options.iconClass = options.iconClass || options.iconClassName;
            options.textClass = options.textClass || options.textClassName;

            //If context is given => convert all function to proxy
            if (context)
                $.each( options, function( id, value ){
                    if ($.isFunction( value ))
                        options[id] = $.proxy( value, context );
                });

            return options;
        }
        //*********************************************************************

        options = $.extend( true, {}, defaultOptions || {}, options, forceOptions || {} );

        $.each(['selected', 'checked', 'active', 'open', 'isOpen'], function(index, id){
            if (options[id] !== undefined){
                options.selected = !!options[id];
                return false;
            }
        });

        options.list = options.list || options.buttons || options.items || options.children;

        options = adjustContentAndContextOptions( options, options.context );

        //Adjust options.content
        if (options.content){
            if ($.isArray( options.content ) )
                //Adjust each record in options.content
                for (var i=0; i<options.content.length; i++ )
                    options.content[i] = adjustContentAndContextOptions( options.content[i], options.context );
            else
                if ($.type( options.content ) == "object")
                    options.content = adjustContentAndContextOptions( options.content, options.context );
        }

        //Sert context = null to avoid "double" proxy
        options.context = null;

        return options;
    };


    /****************************************************************************************
    _bsGetSizeClass
    baseClass: "BASE" useTouchSize: false
        small: false => sizeClass = ''
        small: true  => sizeClass = "BASE-sm"

    baseClass: "BASE" useTouchSize: true
        small: false => sizeClass = 'BASE-sm'
        small: true  => sizeClass = "BASE-xs"
    ****************************************************************************************/
    $._bsGetSizeClass = function( options ){
        var sizeClassPostfix = '';

        if (options.useTouchSize){
            if (ns.bsIsTouch)
                sizeClassPostfix = options.small ? 'sm' : '';
            else
                sizeClassPostfix = options.small ? 'xs' : 'sm';
        }
        else
            sizeClassPostfix = options.small ? 'sm' : '';

        return sizeClassPostfix && options.baseClass ? options.baseClass + '-' + sizeClassPostfix : '';
    };


    /****************************************************************************************
    $._bsCreateElement = internal method to create $-element
    ****************************************************************************************/
    $._bsCreateElement = function( tagName, link, title, textStyle, className, data ){
        var $result;
        if (link){
            $result = $('<a/>');
            if ($.isFunction( link ))
                $result
                    .prop('href', 'javascript:undefined')
                    .on('click', link );
            else
                $result
                    .i18n(link, 'href')
                    .prop('target', '_blank');
        }
        else
            $result = $('<'+tagName+'/>');

        if (title)
            $result.i18n(title, 'title');

        $result._bsAddStyleClasses( textStyle || '' );

        if (className)
            $result.addClass( className );

        if (data)
            $result.data( data );

        return $result;
    };

    /****************************************************************************************
    $._bsCreateIcon = internal method to create $-icon
    ****************************************************************************************/
    var iconfontPrefixRegExp = null;
    $._bsCreateIcon = function( options, $appendTo, title, className/*, insideStack*/ ){
        if (!iconfontPrefixRegExp){
            var prefixes = $.isArray($.ICONFONT_PREFIXES) ? $.ICONFONT_PREFIXES : [$.ICONFONT_PREFIXES];
            iconfontPrefixRegExp = new window.RegExp('(\\s|^)(' + prefixes.join('|') + ')(\\s|$)', 'g');
        }

        var $icon;

        if ($.type(options) == 'string')
            options = {class: options};

        if ($.isArray( options)){
            //Create a stacked icon
             $icon = $._bsCreateElement( 'div', null, title, null, 'container-stacked-icons ' + (className || '')  );

            $.each( options, function( index, opt ){
                $._bsCreateIcon( opt, $icon, null, 'stacked-icon' );
            });

            //If any of the stacked icons have class fa-no-margin => set if on the container
            if ($icon.find('.fa-no-margin').length)
                $icon.addClass('fa-no-margin');
        }
        else {
            var allClassNames = options.icon || options.class || '';

            //Append $.FONTAWESOME_PREFIX if icon don't contain fontawesome prefix ("fa?")
            if (allClassNames.search(iconfontPrefixRegExp) == -1)
                allClassNames = $.FONTAWESOME_PREFIX + ' ' + allClassNames;

            allClassNames = allClassNames + ' ' + (className || '');

            $icon = $._bsCreateElement( 'i', null, title, null, allClassNames );

        }
        $icon.appendTo( $appendTo );
        return $icon;
    };

    /****************************************************************************************
    $._isEqual(obj1, obj2 OR array)
    Check if two objects or arrays are equal
    (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
    @param  {Object|Array|String}  value  The first object or array to compare
    @param  {Object|Array|String}  other  The second object or array to compare
    @return {Boolean}              Returns true if they're equal
    ****************************************************************************************/
    $._isEqual = function (value, other) {
        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function (item1, item2) {
            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!$._isEqual(item1, item2)) return false;
            }
            // Otherwise, do a simple comparison
            else {
                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString())
                        return false;
                }
                else {
                    if (item1 !== item2) return false;
                }
            }
        };

        // Compare properties
          if (type === '[object Array]'){
               for (var i=0; i<valueLen; i++){
                if (compare(value[i], other[i]) === false)
                    return false;
            }
        }
        else
            if (type === '[object Object]'){
                for (var key in value){
                    if ( (value.hasOwnProperty(key)) && (compare(value[key], other[key]) === false))
                        return false;
                }
            }
            else
                // If nothing failed, return simple comparison
                return value == other;

        return true;
    };



    $.fn.extend({
        //_bsAddIdAndName
        _bsAddIdAndName: function( options ){
            this.attr('id', options.id || '');
            this.attr('name', options.name || options.id || '');
            return this;
        },

        /****************************************************************************************
        _bsAddBaseClassAndSize

        Add classes

        options:
            baseClass           [string]
            baseClassPostfix    [string]
            styleClass          [string]
            class               [string]
            textStyle           [string] or [object]. see _bsAddStyleClasses
        ****************************************************************************************/
        _bsAddBaseClassAndSize: function( options ){
            var classNames = options.baseClass ? [options.baseClass + (options.baseClassPostfix || '')] : [];

            classNames.push( $._bsGetSizeClass(options) );

            if (options.styleClass)
                classNames.push( options.styleClass );

            if (options.class)
                classNames.push( options.class );

            this.addClass( classNames.join(' ') );

            this._bsAddStyleClasses( options.textStyle );

            return this;
        },

        /****************************************************************************************
        _bsAddStyleClasses
        Add classes for text-styel

        options [string] or [object]
            Style for the contents. String or object with part of the following
            "left right center lowercase uppercase capitalize normal bold italic" or
            {left: true, right: true, center: true, lowercase: true, uppercase: true, capitalize: true, normal: true, bold: true, italic: true}
        ****************************************************************************************/
        _bsAddStyleClasses: function( options ){
            options = options || {};

            var _this = this,

                bsStyleClass = {
                    //Text color
                    "primary"     : "text-primary",
                    "secondary"   : "text-secondary",
                    "success"     : "text-success",
                    "danger"      : "text-danger",
                    "warning"     : "text-warning",
                    "info"        : "text-info",
                    "light"       : "text-light",
                    "dark"        : "text-dark",

                    //Align
                    "left"        : "text-left",
                    "right"       : "text-right",
                    "center"      : "text-center",

                    //Case
                    "lowercase"   : "text-lowercase",
                    "uppercase"   : "text-uppercase",
                    "capitalize"  : "text-capitalize",

                    //Weight
                    "normal"      : "font-weight-normal",
                    "bold"        : "font-weight-bold",
                    "italic"      : "font-italic"
                };

            $.each( bsStyleClass, function( style, className ){
                if (
                      ( (typeof options == 'string') && (options.indexOf(style) > -1 )  ) ||
                      ( (typeof options == 'object') && (options[style]) )
                    )
                    _this.addClass( className );
            });
            return this;
        },

        /****************************************************************************************
        _bsAddHtml
        Internal methods to add innerHTML to button or other element
        options: array of textOptions or textOptions
        textOptions: {
            icon     : String / {class, data, attr} or array of String / {className, data, attr}
            text     : String or array of String
            vfFormat : String or array of String
            vfValue  : any type or array of any-type
            vfOptions: JSON-object or array of JSON-object
            textStyle: String or array of String
            link     : String or array of String
            title    : String or array of String
            iconClass: string or array of String
            textClass: string or array of String
            textData : obj or array of obj
        }
        checkForContent: [Boolean] If true AND options.content exists => use options.content instead
        ****************************************************************************************/

        _bsAddHtml:  function( options, htmlInDiv, ignoreLink, checkForContent ){
            //**************************************************
            function getArray( input ){
                return input ? $.isArray( input ) ? input : [input] : [];
            }
            //**************************************************
            function isHtmlString( str ){
                if (!htmlInDiv || ($.type(str) != 'string')) return false;

                var isHtml = false,
                    $str = null;
                try       { $str = $(str); }
                catch (e) { $str = null;   }

                if ($str && $str.length){
                    isHtml = true;
                    $str.each( function( index, elem ){
                        if (!elem.nodeType || (elem.nodeType != 1)){
                            isHtml = false;
                            return false;
                        }
                    });
                }
                return isHtml;
            }

            //**************************************************
            options = options || '';

            if (options.content && checkForContent)
                return this._bsAddHtml(options.content, htmlInDiv, ignoreLink);


            var _this = this;

            //options = array => add each
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    _this._bsAddHtml( textOptions, htmlInDiv, ignoreLink );
                });
                return this;
            }

            this.addClass('container-icon-and-text');

            //If the options is a jQuery-object: append it and return
            if (options.jquery){
                this.append( options );
                return this;
            }

            //If the content is a string containing html-code => append it and return
            if (isHtmlString(options)){
                this.append( $(options) );
                return this;
            }

            //Adjust icon and/or text if it is not at format-options
            if (!options.vfFormat)
                options = $._bsAdjustIconAndText( options );

            //options = simple textOptions
            var iconArray       = getArray( options.icon ),
                textArray       = getArray( options.text ),
                vfFormatArray   = getArray( options.vfFormat ),
                vfValueArray    = getArray( options.vfValue ),
                i18nextArray    = getArray( options.i18next ),
                vfOptionsArray  = getArray( options.vfOptions ),
                textStyleArray  = getArray( options.textStyle ),
                linkArray       = getArray( ignoreLink ? [] : options.link || options.onClick ),
                titleArray      = getArray( options.title ),
                iconClassArray  = getArray( options.iconClass ),
                textClassArray  = getArray( options.textClass ),
                textDataArray   = getArray( options.textData );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                $._bsCreateIcon( icon, _this, titleArray[ index ], iconClassArray[index] );
            });

            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            //Add text

            $.each( textArray, function( index, text ){
                //If text ={da,en} and both da and is html-stirng => build inside div
                var tagName = 'span';
                if ( (text.hasOwnProperty('da') && isHtmlString(text.da)) || (text.hasOwnProperty('en') && isHtmlString(text.en)) )
                    tagName = 'div';

                var $text = $._bsCreateElement( tagName, linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index], textDataArray[index] );
                if ($.isFunction( text ))
                    text( $text );
                else
                    if (text == $.EMPTY_TEXT)
                        $text.html( '&nbsp;');
                    else
                        if (text != ""){
                            //If text is a string and not a key to i18next => just add the text
                            if ( ($.type( text ) == "string") && !i18next.exists(text) )
                                $text.html( text );
                            else
                                $text.i18n( text, 'html', i18nextArray[ index ] );
                        }

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );

                $text.appendTo( _this );
            });

            //Add value-format content
            $.each( vfFormatArray, function( index ){
                $._bsCreateElement( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] )
                    .vfValueFormat(
                        vfValueArray[index] || '',
                        vfFormatArray[index],
                        vfOptionsArray[index]
                    )
                    .appendTo( _this );
            });

            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return options.returnFromClick || false;
        },

        /****************************************************************************************
        _bsAppendContent( options, context, arg )
        Create and append any content to this.
        options can be $-element, function, json-object or array of same

        The default bootstrap structure used for elements in a form is
        <div class="form-group">
            <div class="input-group">
                <div class="input-group-prepend">               //optional
                    <button class="btn btn-standard">..</buton> //optional 1-N times
                </div>                                          //optional

                <label class="has-float-label">
                    <input class="form-control form-control-with-label" type="text" placeholder="The placeholder...">
                    <span>The label</span>
                </label>

                <div class="input-group-append">                //optional
                    <button class="btn btn-standard">..</buton> //optional 1-N times
                </div>                                          //optional
            </div>
        </div>
        ****************************************************************************************/
        _bsAppendContent: function( options, context, arg ){

            //Internal functions to create baseSlider and timeSlider
            function buildSlider(options, constructorName, $parent){
                var $sliderInput = $('<input/>').appendTo( $parent ),
                    slider = $sliderInput[constructorName]( options ).data(constructorName),
                    $element = slider.cache.$outerContainer || slider.cache.$container;

                $element
                    .attr('id', options.id)
                    .data('slider', slider );
            }
            function buildBaseSlider(options, $parent){ buildSlider(options, 'baseSlider', $parent); }
            function buildTimeSlider(options, $parent){ buildSlider(options, 'timeSlider', $parent); }

            function buildTextBox( options ){
                return $('<div/>')
                        ._bsAddHtml( options );
            }

            function buildHidden( options ){
                return $.bsInput( options ).css('display', 'none');
            }

            function buildInputGroup( options, $parent ){
                return $parent
                           .attr('id', options.id)
                           .addClass('flex-column')
                           ._bsAppendContent(options.content);
            }


            if (!options)
                return this;

            //Array of $-element, function etc
            if ($.isArray( options )){
                var _this = this;
                $.each(options, function( index, opt){
                    _this._bsAppendContent(opt, context );
                });
                return this;
            }

            //Function: Include arg (if any) in call to method (=options)
            if ($.isFunction( options )){
                arg = arg ? $.isArray(arg) ? arg : [arg] : [];
                arg.unshift(this);
                options.apply( context, arg );
                return this;
            }

            //json-object with options to create bs-elements
            if ($.isPlainObject(options)){
                var buildFunc = $.fn._bsAddHtml,
                    insideFormGroup   = false,
                    addBorder         = false,
                    buildInsideParent = false,
                    noValidation      = false;

                if (options.type){
                    var type = options.type.toLowerCase();
                    switch (type){
                        case 'input'            :   buildFunc = $.bsInput;              insideFormGroup = true; break;
                        case 'button'           :   buildFunc = $.bsButton;             break;
                        case 'buttongroup'      :   buildFunc = $.bsButtonGroup;        break;
                        case 'menu'             :   buildFunc = $.bsMenu;               break;
                        case 'select'           :   buildFunc = $.bsSelectBox;          insideFormGroup = true; break;
                        case 'selectlist'       :   buildFunc = $.bsSelectList;         break;
                        case 'radiobuttongroup' :   buildFunc = $.bsRadioButtonGroup;   addBorder = true; insideFormGroup = true; break;
                        case 'checkbox'         :   buildFunc = $.bsCheckbox;           insideFormGroup = true; break;
                        case 'tabs'             :   buildFunc = $.bsTabs;               break;
                        case 'table'            :   buildFunc = $.bsTable;              break;
                        case 'list'             :   buildFunc = $.bsList;               break;
                        case 'accordion'        :   buildFunc = $.bsAccordion;          break;
                        case 'slider'           :   buildFunc = buildBaseSlider;        insideFormGroup = true; addBorder = true; buildInsideParent = true; break;
                        case 'timeslider'       :   buildFunc = buildTimeSlider;        insideFormGroup = true; addBorder = true; buildInsideParent = true; break;
                        case 'text'             :   buildFunc = $.bsText;               insideFormGroup = true; break;
                        case 'textarea'         :   buildFunc = $.bsTextArea;           insideFormGroup = true; break;
                        case 'textbox'          :   buildFunc = buildTextBox;           insideFormGroup = true; addBorder = true; noValidation = true; break;
                        case 'fileview'         :   buildFunc = $.bsFileView;           break;
                        case 'hidden'           :   buildFunc = buildHidden;            noValidation = true; break;
                        case 'inputgroup'       :   buildFunc = buildInputGroup;        addBorder = true; insideFormGroup = true; buildInsideParent = true; break;
//                        case 'xx'               :   buildFunc = $.bsXx;               break;

                        default                 :   buildFunc = $.fn._bsAddHtml;        buildInsideParent = true;

                    }
                }

                //Overwrite insideFormGroup if value given in options
                if ( $.type( options.insideFormGroup ) == "boolean")
                    insideFormGroup = options.insideFormGroup;

                //Set the parent-element where to append to created element(s)
                var $parent = this,
                    insideInputGroup = false;

                if (insideFormGroup){
                    //Create outer form-group
                    insideInputGroup = true;
                    $parent = $divXXGroup('form-group', options).appendTo( $parent );
                    if (options.smallBottomPadding)
                        $parent.addClass('small-bottom-padding');

                    if (options.lineBefore)
                        $('<hr/>')
                            .addClass('before')
                            .toggleClass('above-label', !!options.label)
                            .appendTo( $parent );

                    if (noValidation || options.noValidation)
                        $parent.addClass('no-validation');
                }
                var $originalParent = $parent;
                if (insideInputGroup || options.prepend || options.before || options.append || options.after){
                    //Create element inside input-group
                    var $inputGroup = $divXXGroup('input-group', options);
                    if (addBorder && !options.noBorder){
                        //Add border and label (if any)
                        $inputGroup.addClass('input-group-border');

                        if (options.darkBorderlabel)
                            $inputGroup.addClass('input-group-border-dark');

                        if (options.label){
                            $inputGroup.addClass('input-group-border-with-label');
                            $('<span/>')
                                .addClass('has-fixed-label')
                                ._bsAddHtml( options.label )
                                .appendTo( $inputGroup );
                        }
                    }
                    $parent = $inputGroup.appendTo( $parent );
                }

                //Build the element. Build inside $parent or add to $parent after
                if (buildInsideParent)
                    buildFunc.call( this, options, $parent );
                else
                    buildFunc.call( this, options ).appendTo( $parent );

                if (options.center)
                    $parent.addClass('justify-content-center text-center');


                var prepend = options.prepend || options.before;
                if (prepend)
                    $('<div/>')
                        .addClass('input-group-prepend')
                        ._bsAppendContent( prepend, options.contentContext  )
                        .prependTo( $parent );
                var append = options.append || options.after;
                if (append)
                    $('<div/>')
                        .addClass('input-group-append')
                        ._bsAppendContent( append, options.contentContext  )
                        .appendTo( $parent );

                if (options.lineAfter)
                    $('<hr/>')
                        .addClass('after')
                        .appendTo( $originalParent );


                return this;
            }

            //Assume it is a $-element or other object that can be appended directly
            this.append( options );
            return this;
        }
    }); //$.fn.extend


}(jQuery, this.i18next, this, document));