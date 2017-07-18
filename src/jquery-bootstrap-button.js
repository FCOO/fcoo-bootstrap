/****************************************************************************
	jquery-bootstrap-button.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    The buttons in Bootstrap can be styled in different ways (btn-primary, btn-outline-primary etc)
    The variable window.bsButtonClass contain the selected class-name  
    */

    //Create namespace
	var ns = window; 

    ns.bsButtonClass        = 'btn-secondary'; 
    ns.bsPrimaryButtonClass = 'btn-outline-primary';


    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options ){
        options = 
            $._bsAdjustOptions( options, {
//                tagName     : 'button',
                tagName     : 'a',//Using <a> instead of <button> to be able to control font-family
                baseClass   : 'btn',
                styleClass  : ns.bsButtonClass,
                class       : '',
                addSizeClass: true,
                addOnClick  : true
            });

        var result = $('<'+ options.tagName + '/>');

        //Adding href that don't scroll to top to allow anchor to get focus
        if (options.tagName == 'a')
            result.prop('href', 'javascript:undefined');

        result._bsAddBaseClassAndSize( options );

        if (options.id)
            result.attr('id', options.id);

        if (options.selected)  
            result.addClass('active');

        if (options.focus)  
            result.addClass('init_focus');

        if (options.attr)
            result.attr( options.attr );

        if (options.prop)
            result.prop( options.prop );

        result.data('bsButton_options', options );

        if (options.addOnClick && options.onClick)
            result.on('click', $.proxy( result._bsButtonOnClick, result ) );

        result._bsAddHtml( options );

        return result;
    };

    /**********************************************************
    bsLinkButton( options ) - create a Bootstrap-button as a link
    **********************************************************/
    $.bsLinkButton = function( options ){
        return $.bsButton( $.extend({}, options, { styleClass: 'btn-link'}) );
    };

    /**********************************************************
    bsCheckboxButton( options ) - create a Bootstrap-button as a checkbox
    options:
        icon: string or array[0-1] of string
        text: string or array[0-1] of string
    If icon and/or text is array[0-1] the first value is used when en button is unselected
    and the second when the button is selected.
    E.g. text: ['Unselected', 'Selected']
    **********************************************************/
    $.bsCheckboxButton = function( options ){
        //Clone options to avoid reflux
        options = $.extend({}, options);

        //Use modernizr-mode and classes if icon and/or text containe two values
        if ($.isArray(options.icon)){
            options.iconClassName = ['hide-for-active', 'show-for-active'];
            options.modernizr = true;
        }
        if ($.isArray(options.text)){
            options.textClassName = ['hide-for-active', 'show-for-active'];
            options.modernizr = true;
        }
        return $.bsButton( options ).checkbox( $.extend(options, {className: 'active'}) );
    };
    
    /**********************************************************
    bsButtonGroup( options ) - create a Bootstrap-buttonGroup
    **********************************************************/
    $.bsButtonGroup = function( options ){
        options = 
            $._bsAdjustOptions( options, {
                tagName               : 'div',
                baseClass             : 'btn-group',
                leftClass             : 'btn-group-left', //Class for group when content is left-align
                centerClass           : '', //Class for group when content is center-align
                verticalClassPostfix  : '-vertical',
                horizontalClassPostfix: '',
                center                : !options.vertical, //Default: center on horizontal and left on vertical
                addSizeClass          : true,
                attr                  : { role: 'group' },
                buttonOptions         : {
                    addSizeClass: false,
                    onClick     : options.onClick                    
                }
            });

        options.baseClassPostfix = options.vertical ? options.verticalClassPostfix : options.horizontalClassPostfix;
        var result = $('<'+ options.tagName + '/>')
                        ._bsAddBaseClassAndSize( options );

        if (options.center)
            result.addClass( options.centerClass );
        else
            result.addClass( options.leftClass );

        if (options.verticalClassPostfix && options.vertical)
            result.addClass(options.baseClass + options.verticalClassPostfix );

        if (options.horizontalClassPostfix && !options.vertical)
            result.addClass(options.baseClass + options.horizontalClassPostfix );

        if (options.attr)
            result.attr( options.attr );
        $.each( options.list, function(index, buttonOptions ){
            $.bsButton( $.extend({}, options.buttonOptions, buttonOptions ) ).appendTo( result );
        });
        return result;
    };

    /**********************************************************
    bsRadioButtonGroup( options ) - create a Bootstrap-buttonGroup
    options:
        id               : id for the group
        onChange         : function(id, selected, $buttonGroup)
	    allowZeroSelected: boolean. If true it is allowed to des-select a selected radio-button.
	                       If allowZeroSelected=true onChange will also be called on the un-selected radio-input
        buttons          : as bsButtonGroup

    **********************************************************/
    $.bsRadioButtonGroup = function( options ){ 
        options = 
            $._bsAdjustOptions( options, 
                {},
                {
                    addOnClick: false
                }
            );
        var result = $.bsButtonGroup( options );

        //Set options for RadioGroup
        $.each( options.list, function(index, buttonOptions ){
            buttonOptions = $._bsAdjustOptions( buttonOptions );
            if (buttonOptions.id && buttonOptions.selected) {
                options.selectedId = buttonOptions.id;
                return false;
            }
        });
        options.className = 'active';
        var radioGroup = $.radioGroup( options );
        radioGroup.addElement( result.children(), options );
        result.data('radioGroup', radioGroup );

        return result;
    };


	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));