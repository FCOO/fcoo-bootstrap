/****************************************************************************
	jquery-bootstrap-accordion.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    //Add/Remove class "show" to .card
    function card_onShown(){
        var $this = $(this);
        if ($this.children('.collapse.show').length)
            $this.addClass('show');
    }
    function card_onHidden(){
        var $this = $(this);
        if (!$this.children('.collapse.show').length)
            $this.removeClass('show');
    }


    //card_onShow_close_siblings: Close all open siblings when card is shown
    function card_onShow_close_siblings(){
        $(this).siblings('.show').children('.collapse').collapse('hide');
    }

    //card_onShown_close_siblings: Close all open siblings when card is shown BUT without animation
    function card_onShown_close_siblings(){
        var $this = $(this);
        if ($this.hasClass('show')){
            $this.addClass('no-transition');
            card_onShow_close_siblings.call(this);
            $this.removeClass('no-transition');
        }
    }

    /**********************************************************
    bsAccordion( options ) - create a Bootstrap-accordion

    <div id="accordion" class="accordion accordion-sm" role="tablist" aria-multiselectable="true">
        <div class="card">
            <div class="card-header" role="tab" id="headingOne" data-toggle="collapse" _data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
            <div id="collapseOne" class="collapse _show" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
                    This is the content
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" role="tab" id="headingTwo" data-toggle="collapse" _data-parent="#accordion" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
        <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
            <div class="card-block">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </div>
        </div>
    </div>
    **********************************************************/
    var accordionId = 0;

    function bsAccordion_asModal( options ){
        return $.bsModal( $.extend( {
                              flexWidth: true,
                              content  : this,
                          }, options)
               );
    }

    $.bsAccordion = function( options ){
        var id = 'bsAccordion'+ accordionId++;
        options =
            $._bsAdjustOptions( options, {}, {
                baseClass   : 'accordion',
                styleClass  : '',
                class       : '',
                content     : ''
            });

        if (options.neverClose){
            options.multiOpen = true;
            options.allOpen   = true;
        }

        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id'      : id,
                            'tabindex': -1,
                            'role'    : "tablist",
                            'aria-multiselectable': true
                        });

        //Adding the children {icon, text, content}
        $.each( options.list, function( index, opt ){


            //Create the header
            opt = $._bsAdjustOptions( opt );

            var headerId   = id + 'header'+index,
                collapseId = id + 'collapse'+index,
                isOpen     = !!options.allOpen || !!opt.selected,
                $card = $('<div/>')
                            .addClass('card')
                            .toggleClass('show', isOpen)
                            .attr({'data-user-id': opt.id || null})
                            .on( 'shown.bs.collapse',  card_onShown )
                            .on( 'hidden.bs.collapse', card_onHidden )
                            .on( 'show.bs.collapse',   options.multiOpen ? null : card_onShow_close_siblings )
/*HER*/                            .on( 'shown.bs.collapse',  options.multiOpen ? null : card_onShown_close_siblings )
                            .appendTo( $result ),
                headerAttr = {
                    'id'  : headerId,
                    'role': 'tab',
                };

            //Add header
            if (!options.neverClose)
                $.extend(headerAttr, {
                    'data-toggle'  : "collapse",
                    'data-parent'  : '#'+id,
                    'href'         : '#'+collapseId,
                    'aria-expanded': true,
                    'aria-controls': collapseId,
                    'aria-target': '#'+collapseId
                });

            $card.append(
                $('<div/>')
                    .addClass('card-header')
                    .toggleClass('collapsed', !isOpen)
                    .toggleClass('collapsible', !options.neverClose)
                    .attr(headerAttr)
                    ._bsAddHtml( opt.header || opt )
                    //Add chevrolet-icon
                    .append( options.neverClose ? null : $('<i/>').addClass('fa chevrolet') )
            );

            //Add content-container
            var $outer =
                $('<div/>')
                    .addClass('collapse')
                    .toggleClass('show', isOpen)
                    .attr({
                        'id'             : collapseId,
                        'role'           : 'tabpanel',
                        'aria-labelledby': headerId
                    })
                    .appendTo( $card ),

                $contentContainer =
                    $('<div/>')
                        .addClass('card-block')
                        .appendTo( $outer );

            //Add footer
            if (opt.footer)
                $('<div/>')
                    .addClass('card-footer')
                    ._bsAddHtml( opt.footer )
                    .appendTo( $outer );

            //Add content: string, element, function or children (=accordion)
            if (opt.content)
                $contentContainer._bsAppendContent( opt.content, opt.contentContext );

            //If opt.list exists => create a accordion inside $contentContainer
            if ($.isArray(opt.list))
                $.bsAccordion( {
                    allOpen   : options.allOpen,
                    multiOpen : options.multiOpen,
                    neverClose: options.neverClose,
                    list: opt.list
                } )
                    .appendTo( $contentContainer );
        }); //End of $.each( options.list, function( index, opt ){

        $result.collapse(/*options*/);
        $result.asModal = bsAccordion_asModal;

        return $result;
    };


    //Extend $.fn with method to open a card given by id (string) or index (integer)
    $.fn.bsOpenCard = function( indexOrId ){
        this.addClass('no-transition');
        var $card =
                this.children(
                    $.type(indexOrId) == 'number' ?
                    'div.card:nth-of-type('+(indexOrId+1)+')' :
                    'div.card[data-user-id="' + indexOrId + '"]'
                );
        if ($card && $card.length)
            $card.children('.collapse').collapse('show');
        this.removeClass('no-transition');
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-button.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    var bsButtonClass = 'btn-standard';  //MUST correspond with $btn-style-name in src/_variables.scss

    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options ){
        var optionToClassName = {
                primary    : 'primary',
                transparent: 'transparent',
                square     : 'square',
                bigIcon    : 'big-icon'
            };

        options = options || {};
        options =
            $._bsAdjustOptions( options, {
                tagName       : 'a', //Using <a> instead of <button> to be able to control font-family
                baseClass     : 'btn',
                styleClass    : bsButtonClass,
                class         : function( opt ){
                                    var result = '';
                                    $.each( optionToClassName, function( id, className ){
                                        if (opt[id])
                                            result = result + (result?' ':'') + className;
                                    });
                                    return result;
                                } (options),
                useTouchSize  : true,
                addOnClick    : true
            });

        var result = $('<'+ options.tagName + ' tabindex="0"/>');

        if (options.tagName == 'a'){
            if (options.link)
                result
                    .i18n($._bsAdjustText(options.link), 'href')
                    .prop('target', '_blank');
            else
                //Adding href that don't scroll to top to allow anchor to get focus
                result.prop('href', 'javascript:undefined');
        }

        result._bsAddBaseClassAndSize( options );
        if (!options.radioGroup)
            result._bsAddIdAndName( options );

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

        result._bsAddHtml( options, false, true );

        if (options.radioGroup)
            options.radioGroup.addElement( result, options );

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

        options.class = 'allow-zero-selected';

        //Use modernizr-mode and classes if icon and/or text containe two values
        if ($.isArray(options.icon) && (options.icon.length == 2)){
            options.icon = [[
                options.icon[0]+ ' icon-hide-for-active',
                options.icon[1]+ ' icon-show-for-active'
            ]];
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
                useTouchSize          : true,
                attr                  : { role: 'group' },
                buttonOptions         : { onClick: options.onClick }
            });

        options.baseClassPostfix = options.vertical ? options.verticalClassPostfix : options.horizontalClassPostfix;
        var result = $('<'+ options.tagName + '/>')
                        ._bsAddIdAndName( options )
                        ._bsAddBaseClassAndSize( options );

        if (options.center)
            result.addClass( options.centerClass );
        else
            result.addClass( options.leftClass );

        if (options.verticalClassPostfix && options.vertical)
            result.addClass(options.baseClass + options.verticalClassPostfix );

        if (options.horizontalClassPostfix && !options.vertical)
            result.addClass(options.baseClass + options.horizontalClassPostfix );

        if (options.allowZeroSelected)
            result.addClass( 'allow-zero-selected' );

        if (options.fullWidth)
            result.addClass('btn-group-full-width');

        if (options.border)
            result.addClass('btn-group-border');

        if (options.attr)
            result.attr( options.attr );

        $.each( options.list, function(index, buttonOptions ){
            if (buttonOptions.id)
                $.bsButton( $.extend({}, options.buttonOptions, buttonOptions ) )
                    .appendTo( result );
            else
                $('<div/>')
                    .addClass('btn-group-header')
                    ._bsAddHtml( buttonOptions )
                    .appendTo( result );
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
        //Set options for RadioGroup
        $.each( options.list, function(index, buttonOptions ){
            buttonOptions = $._bsAdjustOptions( buttonOptions );
            if (buttonOptions.id && buttonOptions.selected) {
                options.selectedId = buttonOptions.id;
                return false;
            }
        });

        var radioGroup =
                $.radioGroup(
                    $.extend({}, options, {
                        radioGroupId     : options.id,
                        className        : 'active',
                        allowZeroSelected: false
                    })
                );

        options =
            $._bsAdjustOptions( options, {}, {
                useTouchSize: true,
                addOnClick: false,
                buttonOptions: {
                    radioGroup: radioGroup
                }
            } );

        var result = $.bsButtonGroup( options );

        result.data('radioGroup', radioGroup );

        return result;
    };


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-checkbox.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    /**********************************************************
    bsCheckbox( options ) - create a Bootstrap checkbox
    **********************************************************/
    $.bsCheckbox = function( options ){
        options.type = options.type || 'checkbox';
        options =
            $._bsAdjustOptions( options, {
                useTouchSize: true,
                baseClass   : options.type
            });

        //Create outer div
        var $result = $('<div/>')._bsAddBaseClassAndSize( options ),

        //Create input-element
            $input =
                $('<input/>')
                    .prop({
                        type   : 'checkbox',
                        checked: options.selected
                    })
                    ._bsAddIdAndName( options )
                    .appendTo( $result );

        //Create input-element as checkbox from jquery-checkbox-radio-group
        $input.checkbox( options );

        //Get id and update input.id
        var id = $input.data('cbx_options').id;
        $input.prop({id: id });

        //Add label
        var $label = $('<label/>')
                        .prop('for', id )
                        .appendTo( $result );

        //Add <i> with check-icon if it is a checkbox
        if (options.type == 'checkbox')
            $('<i class="fas fa-check"/>').appendTo( $label );

        if (options.text)
            $('<span/>').i18n( options.text ).appendTo( $label );

        return $result;
    };
}(jQuery, this, document));


;
/****************************************************************************
	jquery-bootstrap-file-view.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsFileView creates a <div>-element with viewer of a file (if possible) and
    buttons to view the file in bsModalFile and in a new Tab Page

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";

    //fileViewModalList = list of {fileNames, bsModal}  where bsModal is the $.bsModalFile showing the file
    var fileViewModalList = [];
    function showFileInModal( fileName, header ){
        var fileViewModal = null,
            fileNames     = fileName.da + fileName.en;
        $.each( fileViewModalList, function( index, fileView ){
            if (fileView.fileNames == fileNames){
                fileViewModal = fileView;
                return false;
            }
        });

        if (!fileViewModal){
            fileViewModal = {
                fileNames: fileNames,
                bsModal  : $.bsModalFile( fileName, {header: header, show: false})
            };
            fileViewModalList.push(fileViewModal);
        }
        fileViewModal.bsModal.show();
    }


    /**********************************************************
    **********************************************************/
    $.bsFileView = $.bsFileview = function( options ){
        options = options || {};
        var fileName    = $._bsAdjustText(options.fileName),
            theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $result     = $('<div/>');

        //Create the header (if any)
        if (options.header)
            $('<div/>')
                .addClass('file-view-header')
                ._bsAddHtml(options.header)
                .appendTo($result);

        //Create the view
        var $container =
                $('<div/>')
                    .addClass('file-view-content text-center')
                    .appendTo($result);

        switch (fileNameExt){
            //*********************************************
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'png':
            case 'tiff':
            case 'bmp':
            case 'ico':
                $('<img src="' + theFileName + '"/>')
                    .css('width', '100%')
                    .appendTo($container);

                break;

            //*********************************************
            default:
                $container._bsAddHtml({ text: {
                    da: 'Klik på <i class="far fa-window-maximize"/> for at se dokumentet i et nyt vindue<br>Klik på <i class="fas ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                    en: 'Click on <i class="far fa-window-maximize"/> to see the document in a new window<br>Click on <i class="fas ' + $.bsExternalLinkIcon + '"/> to see the document in a new Tab Page'
                }});
        }

        //Create the Show and Open-buttons
        $('<div/>')
            .addClass('modal-footer')
            .css('justify-content',  'center')
            ._bsAppendContent([
                $.bsButton( {icon:'far fa-window-maximize',  text: {da:'Vis',  en:'Show'},   onClick: function(){ showFileInModal( fileName, options.header ); } } ),
                $.bsButton( {icon: $.bsExternalLinkIcon, text: {da: 'Åbne', en: 'Open'}, link: fileName } )
            ])
            .appendTo($result);

        return $result;
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
	jquery-bootstrap-fontawesome.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /*******************************************
    $.bsMarkerIcon(colorClassName, borderColorClassName, options)
    Return options to create a marker-icon = round icon with
    inner color given as color in colorClassName and
    border-color given as color in borderColorClassName
    options:
        faClassName: fa-class for symbol. Default = "fa-circle"
        extraClassName: string or string[]. Extra class-name added
        partOfList : true if the icon is part of a list => return [icon-name] instead of [[icon-name]]
    ********************************************/
    $.bsMarkerIcon = function(colorClassName, borderColorClassName, options){
        options = $.extend({
            faClassName   : 'fa-circle',
            extraClassName: '',
            partOfList    : false
        }, options || {});

        colorClassName       = colorClassName || 'text-white';
        borderColorClassName = borderColorClassName || 'text-black';

        var className =
                options.faClassName + ' ' +
                ($.isArray(options.extraClassName) ? options.extraClassName.join(' ') : options.extraClassName) +
                ' ';
        var result = [
            'fas ' + className + colorClassName,
            'far ' + className + borderColorClassName
        ];

        return options.partOfList ? result : [result];
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-form.js

	(c) 2018, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    var formId = 0,
        inputId = 0;


    var defaultOptions = {
            content       : '',
            show          : false,
            closeText     : {da:'Annullér', en:'Cancel'},
            submitIcon    : 'fa-check',
            submitText    : {da:'Ok', en:'Ok'},
            buttons       : [],     //Extra button between
            static        : true,   //Only close modal-form on (X)
            formValidation: false,  //When true: make room for formValidation messages
        };


    //BsModalinput = internal object representing an input-element in the form
    function BsModalInput( options, modalForm ){
        this.options = options;
        this.modalForm = modalForm;
        this.options.userId = this.options.id;
        this.options.id = 'bsInputId' + inputId++;
    }

    BsModalInput.prototype = {
        /*******************************************************
        getElement
        *******************************************************/
        getElement: function(){
            this.$element = this.$element || this.modalForm.$form.find( '#'+ this.options.id );
            return this.$element;
        },

        /*******************************************************
        getSlider
        *******************************************************/
        getSlider: function(){
            this.slider = this.slider || this.getElement().data('slider');
            return this.slider;
        },

        /*******************************************************
        getSelectpicker
        *******************************************************/
        getSelectpicker: function(){
            this.selectpicker = this.selectpicker || this.getElement().data('selectpicker').selectpicker;
            return this.selectpicker;
        },

        /*******************************************************
        getRadioGroup
        *******************************************************/
        getRadioGroup: function(){
            this.radioGroup = this.radioGroup || this.getElement().data('radioGroup');
            return this.radioGroup;
        },

        /*******************************************************
        getFormGroup
        *******************************************************/
        getFormGroup: function(){
            this.$formGroup = this.$formGroup || this.getElement().parents('.form-group').first();
            return this.$formGroup;
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(value, validate){
            var $elem = this.getElement();
            switch (this.options.type || 'input'){
                case 'input'            : $elem.val( value );                      break;
                case 'select'           : $elem.selectpicker('val', value );       break;
                case 'checkbox'         : $elem.prop('checked', !!value );         break;
                case 'selectlist'       : this.getRadioGroup().setSelected(value); break;
                case 'radiobuttongroup' : this.getRadioGroup().setSelected(value); break;

                case 'slider'           :
                case 'timeslider'       : this.getSlider().setValue( value );      break;
                case 'text'             :                                          break;
                case 'hidden'           : $elem.val( value );                      break;
            }
            this.onChanging();
            return validate ? this.validate() : this;
        },

        /*******************************************************
        getResetValue: function(){
        *******************************************************/
        getResetValue: function(){
            var result = null;
            switch (this.options.type || 'input'){
                case 'input'            : result = '';    break;
                case 'select'           : result = null;  break;
                case 'checkbox'         : result = false; break;
                case 'selectlist'       : result = this.getRadioGroup().options.list[0].id; break;
                case 'radiobuttongroup' : result = this.getRadioGroup().options.list[0].id; break;

                case 'slider'           :
                case 'timeslider'       : result = this.getSlider().result.min; break;
                case 'text'             : result = '';                          break;
                case 'hidden'           : result = '';                          break;
            }
            return result;
        },

        /*******************************************************
        resetValue
        *******************************************************/
        resetValue: function( onlyResetValidation ){
            this.modalForm._resetInputValidation( this );
            if (!onlyResetValidation)
                return this.setValue( this.getResetValue() );
        },

        /*******************************************************
        _getSliderValue
        *******************************************************/
        _getSliderValue: function(){
            return this.getSlider().result.value;
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(){
            var $elem = this.getElement(),
                result = null;
            switch (this.options.type || 'input'){
                case 'input'            : result = $elem.val();               break;
                case 'select'           : result = $elem.selectpicker('val'); break;
                case 'checkbox'         : result = !!$elem.prop('checked');   break;
                case 'selectlist'       : result = this.getRadioGroup().getSelected(); break;
                case 'radiobuttongroup' : result = this.getRadioGroup().getSelected(); break;
                case 'slider'           :
                case 'timeslider'       : result = this._getSliderValue(); break;
                case 'text'             : result = ' ';                    break;
                case 'hidden'           : result = $elem.val();            break;
            }
            return result ===null ? this.getResetValue() : result;
        },

        /*******************************************************
        addValidation - Add the validations
        *******************************************************/
        addValidation: function(){
            this.modalForm._addInputValidation( this );
        },

        /*******************************************************
        validate
        *******************************************************/
        validate: function(){
            this.modalForm._validateInput( this );
            return this;
        },

        /*******************************************************
        onChanging
        *******************************************************/
        onChanging: function(){
            if (this.modalForm.isCreated){
                this.modalForm.showOrHide( this );
                this.modalForm.onChanging();
            }
        },

        /*******************************************************
        showOrHide
        Show or hide the input if any of the id:value in options.showWhen or hideWhen exists
        *******************************************************/
        showOrHide: function( values ){
            if (this.options.showWhen || this.options.hideWhen){
                var show = !this.options.showWhen; //If showWhen is given default is false = not show
                $.each( this.options.hideWhen || {}, function( userId, value ){
                    if (values[userId] == value)
                        show = false;
                });
                $.each( this.options.showWhen || {}, function( userId, value ){
                    if (values[userId] == value)
                        show = true;
                });

                //Reset the validation if the field is hidden
                if (!show){
                    this.getElement().prop('disabled', false);
                    this.resetValue( true );
                }

                this.getFormGroup().css('visibility', show ? 'visible' : 'hidden');
                this.getElement().prop('disabled', !show);

                this.modalForm._enableInputValidation( this, show );
            }
            return this;
        },
    }; //End of BsModalInput.prototype

    /************************************************************************
    *************************************************************************
    BsModalForm( options )
    options:
        content: json-object with full content Samer as content for bsModal with extention of
            id, and
            showWhen and hideWhen = [id] of value: hide or show element when another element with id has value

        extended.content: Same as options.content, but NOT BOTH
        useExtended: false - When true the extended.content is used as the content of the form
        onChanging: function( values ) - called when the value of any of the elements are changed
        onSubmit  : function( values ) - called when the form is submitted
    *************************************************************************
    ************************************************************************/
    function BsModalForm( options ){
        var _this = this;
        this.options = $.extend(true, {}, defaultOptions, options );
        this.options.id = this.options.id || 'bsModalFormId' + formId++;

        this.options.onClose_user = this.options.onClose || function(){};
        this.options.onClose = $.proxy( this.onClose, this );

        //this.input = simple object with all input-elements. Also convert element-id to unique id for input-element
        this.inputs = {};

        var types = ['input', 'select', 'selectlist', 'radiobuttongroup', 'checkbox', 'radio', 'table', 'slider', 'timeslider', 'hidden'];

        function setId( dummy, obj ){
            if ($.isPlainObject(obj) && (obj.type !== undefined) && (types.indexOf(obj.type) >= 0) && obj.id){
                var bsModalInput = new BsModalInput( obj, _this ),
                    onChangingFunc = $.proxy( bsModalInput.onChanging, bsModalInput );

                //Set options to call onChanging
                switch (obj.type){
                    case 'slider'    :
                    case 'timeslider': obj.onChanging = onChangingFunc; break;
                    default          : obj.onChange = onChangingFunc;
                }
                //Add element to inputs
                _this.inputs[obj.id] = bsModalInput;
            }
            else
                if ($.isPlainObject(obj) || ($.type(obj) == 'array'))
                    $.each( obj, setId );
        }


        if (this.options.extended && this.options.useExtended)
            setId( 'dummy', this.options.extended);
        else
            setId( 'dummy', this.options.content);

        //Create a hidden submit-button to be placed inside the form
        var $hiddenSubmitButton = this.$hiddenSubmitButton = $('<button type="submit" style="display:none"/>');

        //Add submit-button
        this.options.buttons.push({
            icon     : this.options.submitIcon,
            text     : this.options.submitText,
            className: 'primary min-width',
            focus    : true,
            onClick  : function(){ $hiddenSubmitButton.trigger('click'); }
        });

        this.options.show = false; //Only show using method edit(...)

        //Create the form
        this.$form = $('<form/>');

        if (this.options.extended && this.options.useExtended){
            this.$form._bsAppendContent( this.options.extended.content, this.options.contentContext );
            this.options.extended.content = this.$form;
        }
        else {
            this.$form._bsAppendContent( this.options.content, this.options.contentContext );
            this.options.content = this.$form;
        }

        if (this.options.formValidation)
            this.$form.addClass('form-validation');

        //Create the modal
        this.$bsModal = $.bsModal( this.options );

        //Append the hidden submit-button the the form
        this.$form.append( $hiddenSubmitButton );

        //Get the button used to submit the form
        var bsModalDialog = this.$bsModal.data('bsModalDialog'),
            $buttons = bsModalDialog.bsModal.$buttons;

        this.$submitButton = $buttons[$buttons.length-1];

        //Add the validator
        this._addValidation();

        //Add the validations
        this._eachInput( function( input ){
            input.addValidation();
        });

        //Add onSubmit
        this._addOnSubmit( $.proxy(this.onSubmit, this) );

        return this;
    }

    /*******************************************************
    Export to jQuery
    *******************************************************/
    $.BsModalForm = BsModalForm;
    $.bsModalForm = function( options ){
        return new $.BsModalForm( options );
    };

    /*******************************************************
    Extend the prototype
    Methods marked with (*) are (almost) empty and must be defined
    with the used validator
    *******************************************************/
	$.BsModalForm.prototype = {

        /*******************************************************
        edit
        *******************************************************/
        edit: function( values, tabIndexOrId ){
            this.$bsModal.show();

            if (tabIndexOrId !== undefined)
                this.$bsModal.bsSelectTab(tabIndexOrId);

            this.setValues( values, false, true );

            this.originalValues = this.getValues();

            //Reset validation
            this.$bsModal.find(':disabled').prop('disabled', false );
            this._resetValidation();

            this.showOrHide( null );
            this.isCreated = true;
        },

        /*******************************************************
        isDifferent( values ) - retur true if values is differnet from this.getValues()
        *******************************************************/
        isDifferent: function( values ){
            //Check if any of the new values are different from the original ones
            var newValues = this.getValues(),
                result = false;

            $.each( newValues, function(id, value){
                if (!values.hasOwnProperty(id) || (values[id] != value)){
                    result = true;
                    return false;
                }
            });

            return result;
        },

        /*******************************************************
        onClose
        *******************************************************/
        onClose: function(){
            //Check if any of the new values are different from the original ones
            if (!this.isDifferent(this.originalValues)){
                this.options.onClose_user();
                return true;
            }

            var _this = this,
                noty =
                $.bsNoty({
                    type     : 'info',
                    modal    : true,
                    layout   :'center',
                    closeWith:['button'],
                    force    : true,
                    textAlign: 'center',
                    text     : {da:'Skal ændringeren gemmes?', en:'Do you want to save the changes?'},
                    buttons  : [
                        {
                            text: defaultOptions.closeText,
                            onClick: function(){
                                noty.close();
                            }
                        },
                        {
                            text:{da:'Gem ikke', en:'Don\'t Save'},
                            onClick: function(){
                                if (_this.options.onCancel)
                                    _this.options.onCancel(_this.originalValues);
                                _this.originalValues = _this.getValues();
                                noty.on('afterClose', function(){ _this.$bsModal.close(); });
                                noty.close();
                            }
                        },
                        {
                            text:{da:'&nbsp;&nbsp;&nbsp;&nbsp;Gem&nbsp;&nbsp;&nbsp;&nbsp;', en:'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Save&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'},
                            onClick: function(){
                                noty.on('afterClose', function(){ _this.$hiddenSubmitButton.trigger('click'); });
                                noty.close();
                            }
                        }
                    ]
                });
            return false;
        },


        /*******************************************************
        _addOnSubmit (*)
        *******************************************************/
        _addOnSubmit: function( onSubmitFunc ){
            this.$form.on('submit', onSubmitFunc );
        },

        /*******************************************************
        _addValidation (*)
        *******************************************************/
        _addValidation: function(){
        },

        /*******************************************************
        _resetValidation (*)
        *******************************************************/
        _resetValidation: function(){
        },

        /*******************************************************
        _addInputValidation (*)
        *******************************************************/
        _addInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _validateInput (*)
        *******************************************************/
        _validateInput: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _resetInputValidation (*)
        *******************************************************/
        _resetInputValidation: function( /*bsModalInput*/ ){
        },

        /*******************************************************
        _enableInputValidation (*)
        *******************************************************/
        _enableInputValidation: function( /*bsModalInput, enabled*/ ){
        },


        /*******************************************************
        _eachInput
        *******************************************************/
        _eachInput: function( func ){
            $.each( this.inputs, function( id, input ){
                func( input );
            });
        },

        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(id, value){
            return this.inputs[id] ? this.inputs[id].setValue( value ) : null;
        },

        /*******************************************************
        setValues
        *******************************************************/
        setValues: function(values, validate, restUndefined){
            this._eachInput( function( input ){
                var value = values[input.options.userId];
                if ( value != undefined)
                    input.setValue(value, validate);
                else
                    if (restUndefined)
                        input.resetValue();
            });
        },

        /*******************************************************
        getValue
        *******************************************************/
        getValue: function(id){
            return this.inputs[id] ? this.inputs[id].getValue() : null;
        },

        /*******************************************************
        getValues
        *******************************************************/
        getValues: function(){
            var result = {};
            this._eachInput( function( input ){ result[input.options.userId] = input.getValue(); });
            return result;
        },

        /*******************************************************
        showOrHide - call showOrHide for all inputs except excludeInput
        *******************************************************/
        showOrHide: function( excludeInput ){
            var values = this.getValues();
            this._eachInput( function( input ){
                if (input !== excludeInput)
                    input.showOrHide( values );
            });
        },

        /*******************************************************
        onChanging = called every any of the element is changed
        *******************************************************/
        onChanging: function(){
            //Test if values used in last event-fire is different from current values
            if (this.isCreated && this.options.onChanging && this.isDifferent(this.onChangingValues || {})) {
                this.onChangingValues = this.getValues();
                this.options.onChanging( this.onChangingValues );
            }
        },

        /*******************************************************
        onSubmit = called when the form is valid and submitted
        *******************************************************/
        onSubmit: function( event/*, data*/ ){
            this.options.onSubmit ? this.options.onSubmit( this.getValues() ) : null;

            this.$bsModal._close();
            this.options.onClose_user();

            event.preventDefault();
            return false;
        },

    };
}(jQuery, this, document));


;
/****************************************************************************
	jquery-bootstrap-header.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /*
    A header can contain any of the following icons:
    back (<)
    forward (>)
    extend (^)
    diminish
    pin
    unpin

    close (x)

    */

    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsHeaderIcons = {
        back    : 'fa-chevron-left',
        forward : 'fa-chevron-right',

        pin     : ['fas fa-thumbtack fa-inside-circle', 'far fa-circle'],
        unpin   : 'fa-thumbtack',

        extend  : 'fa-chevron-up',
        diminish: 'fa-chevron-down',

        new     : ['far fa-window-maximize fa-inside-circle2', 'far fa-circle'],

        close   : ['fas fa-circle back', 'far fa-times-circle middle', 'far fa-circle front']
    };

    //mandatoryHeaderIconClass = mandatory class-names and title for the different icons on the header
    var mandatoryHeaderIconClassAndTitle = {
        close: {class:'header-icon-close', title: {da:'Luk', en:'Close'}},
    };

    /******************************************************
    _bsHeaderAndIcons(options)
    Create the text and icon content of a header inside this
    options: {
        headerClassName: [string]
        icons: {
            back, forward, ..., close: { title: [string], disabled: [boolean], className: [string], altEvents: [string], onClick: [function] },
        }
    }

    ******************************************************/

    function checkDisabled( event ){
        var $target = $(event.target);
        if ($target.hasClass('disabled') || $target.prop('disabled'))
            event.stopImmediatePropagation();
    }

    $.fn._bsHeaderAndIcons = function(options){
        var $this = this;

        options = $.extend( true, {headerClassName: '', inclHeader: true, icons: {} }, options );
        this.addClass( options.headerClassName );

        if (options.inclHeader){
            options.header = $._bsAdjustIconAndText(options.header);
            //If header contents more than one text => set the first to "fixed" so that only the following text are truncated
            if ($.isArray(options.header) && (options.header.length > 1)){
                options.header[0].textClass = 'fixed-header';
            }
            this._bsAddHtml( options.header || $.EMPTY_TEXT );
        }
        //Add icons (if any)
        if ( !$.isEmptyObject(options.icons) ) {
            //Container for icons
            var $iconContainer =
                    $('<div/>')
                        ._bsAddBaseClassAndSize( {
                            baseClass   :'header-icon-container',
                            useTouchSize: true
                        })
                        .appendTo( this );

            //Add icons
            $.each( ['back', 'forward', 'pin', 'unpin', 'extend', 'diminish', 'new', 'close'], function( index, id ){
                var iconOptions = options.icons[id],
                    classAndTitle = mandatoryHeaderIconClassAndTitle[id] || {};

                if (iconOptions && iconOptions.onClick){
                    $._bsCreateIcon(
                        $.bsHeaderIcons[id],
                        $iconContainer,
                        iconOptions.title || classAndTitle.title || '',
                        (iconOptions.className || '') + ' header-icon ' + (classAndTitle.class || '')
                    )
                    .toggleClass('hidden', !!iconOptions.hidden)
                    .toggleClass('disabled', !!iconOptions.disabled)
                    .attr('data-header-icon-id', id)
                    .on('click', checkDisabled)
                    .on('click', iconOptions.onClick);

                    //Add alternative (swipe) event
                    if (iconOptions.altEvents)
                        $this.on( iconOptions.altEvents, iconOptions.onClick );
                }
            });
        }
        return this;
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-input.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    $.extend({
        /******************************************************
        $.bsInput( options )
        Create a <input type="text" class="form-control"> inside a <label>
        Also add input-mask using https://github.com/RobinHerbots/Inputmask
        ******************************************************/
        bsInput: function( options ){
            if (options.inputmask)
                options.placeholder = null;

            var $input =
                    $('<input/>')
                        ._bsAddIdAndName( options )
                        .addClass('form-control-border form-control')
                        .attr('type', 'text');

            if (options.inputmask){
                /* NOT USED FOR NOW
                var updateFunc = $.proxy($input._onInputmaskChanged, $input);
                options.inputmask.oncomplete   = options.inputmask.oncomplete   || updateFunc;
                options.inputmask.onincomplete = options.inputmask.onincomplete || updateFunc;
                options.inputmask.oncleared    = options.inputmask.oncleared    || updateFunc;
                */

                //Bug fix in chrome: Keep mask in input to prevent label "flicking"
                options.inputmask.clearMaskOnLostFocus = false;

                $input.inputmask(options.inputmask);
            }

            return $input._wrapLabel(options);
        },

    });


    $.fn.extend({
        /* NOT USED FOR NOW
        _onInputmaskChanged: function( inputmaskStatus ){
            var $this = $(this);
            $(this).closest('.form-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
            $(this).closest('.input-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
        },
        */

        /******************************************************
        _wrapLabel( options )
        Wrap the element inside a <label> and add
        options.placeholder and options.label
            <label class="has-float-label">
                <THIS placeholder="options.placeholder"/>
                <span>options.label</span>
            </label>
        Return the label-element
        ******************************************************/
        _wrapLabel: function(options){
            this.addClass('form-control-with-label');

            var $label = $('<label/>').addClass('has-float-label');
            $label.append( this );

            if (options.placeholder)
                this.i18n( options.placeholder, 'placeholder' );

            $('<span/>')
                ._bsAddHtml( options.label )
                .appendTo( $label )
                .on('mouseenter', function(){ $label.addClass('hover');    })
                .on('mouseleave', function(){ $label.removeClass('hover'); });

            return $label;
        },
    });


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-list.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsList( options )
options
    columns = [] of {
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        :  'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
    }

    verticalBorder: [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder      : [boolean] true. When true no borders are visible

    align        : 'left','center','right'. Defalut = 'left' = default align for all columns
    verticalAlign: 'top', 'middle','bottom'. Default = 'middle' = default verticalAlign for all columns



*******************************************************************/
    var defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            sortable     : false
        },

        defaultOptions = {
            showHeader      : false,
            verticalBorder  : false,
            noBorder        : true,
            hoverRow        : false,
            noPadding       : true,

            align           : defaultColunmOptions.align,
            verticalAlign   : defaultColunmOptions.verticalAlign,

            content         : []
        };

    $.bsList = function( options ){
        //Adjust options but without content since it isn't standard
        var content = options.content;
        options.content = [];
        options = $._bsAdjustOptions( options, defaultOptions );
        options.content = content;

        var nofColumns = 1;
        //Adjust options.content and count number of columns
        $.each(options.content, function( index, rowContent ){
            rowContent = $.isArray( rowContent ) ? rowContent : [rowContent];
            nofColumns = Math.max(nofColumns, rowContent.length);

            var rowContentObj = {};
            $.each(rowContent, function( index, cellContent ){
                rowContentObj['_'+index] = cellContent;
            });

            options.content[index] = rowContentObj;
        });

        options.columns = options.columns || [];
        var optionsAlign = {
                align        : options.align,
                verticalAlign: options.verticalAlign
            };

        //Create columns-options for bsTable
        for (var i=0; i<nofColumns; i++ )
            options.columns[i] = $.extend({id:'_'+i}, defaultColunmOptions, optionsAlign, options.columns[i]);

        return $.bsTable( options );
    };
}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-modal-backdrop.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    Global methods to provide backdrop for modal windows and noty

****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    var zindexModalBackdrop = 1040, //MUST be equal to $zindex-modal-backdrop in bootstrap/scss/_variables.scss
        zindexAllwaysOnTop  = 9999,
        modalBackdropLevels = 0,
        $modalBackdrop = null;

    /******************************************************
    $.fn._setModalBackdropZIndex
    Set the z-index of this to the current level
    If a className is given => use it, else
    If delta === true the z-index is set to zindexAllwaysOnTop (9999), else
    increase currwent z-index by 10
    ******************************************************/
    $.fn._setModalBackdropZIndex = function( delta, className ){
        if (className)
            this.addClass( className );
        else
            this.css('z-index', delta === true ? zindexAllwaysOnTop : zindexModalBackdrop + modalBackdropLevels*10  + (delta?delta:0));
        return this;
    };

    /******************************************************
    $._addModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    $._addModalBackdropLevel = function(){
        modalBackdropLevels++;

        if (!$modalBackdrop)
            $modalBackdrop =
                $('<div/>')
                    .addClass('global-backdrop')
                    .appendTo( $('body') );

        $modalBackdrop
            ._setModalBackdropZIndex( -1 )
            .removeClass('hidden')
            .addClass('show');
    };

    /******************************************************
    $._removeModalBackdropLevel
    Move the backdrop up in z-index
    ******************************************************/
    $._removeModalBackdropLevel = function( noDelay ){
        modalBackdropLevels--;

        $modalBackdrop._setModalBackdropZIndex( -1 );
        if (!modalBackdropLevels){
            $modalBackdrop
                .removeClass('show');
            if (noDelay)
                $modalBackdrop.addClass('hidden');
            else
                window.setTimeout( function(){ $modalBackdrop.addClass('hidden'); }, 2000 );
        }
    };
}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-modal-file.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next,  window /*, document, undefined*/) {
	"use strict";



    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsExternalLinkIcon = 'fa-external-link-alt';

    /**********************************************************
    modalFileLink( fileName, bsModalOptions )
    Return a link to bsModalFile
    **********************************************************/
    $.modalFileLink = function( fileName, bsModalOptions ){
        fileName = $._bsAdjustText(fileName);
        return window.PDFObject.supportsPDFs ?
            function(){ return $.bsModalFile( fileName, bsModalOptions ); } :
            fileName;
    };


    /**********************************************************
    updateImgZoom( $im)
    **********************************************************/
    var ZoomControl = function( $img ){
        this.$img = $img;
        this.zooms = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];
        this.zoomIndex = this.zooms.indexOf(100);
    };

    ZoomControl.prototype = {
        getButtons: function(){
            var _this = this;
            this.$zoomOutButton = $.bsButton({type:'button', icon:'fa-search-minus',  text:{da:'Zoom ud',  en:'Zoom Out'}, onClick: _this.zoomOut, context: _this });
            this.$zoomInButton  = $.bsButton({type:'button', icon:'fa-search-plus',   text:{da:'Zoom ind', en:'Zoom In'},  onClick: _this.zoomIn,  context: _this });

            return [this.$zoomOutButton, this.$zoomInButton];
        },

        zoomIn : function(){ this.update(false); },
        zoomOut: function(){ this.update(true);  },

        mousewheel: function( event ){
            var delta =
                    event.deltaX ? event.deltaX :
                    event.deltaY ? event.deltaY :
                    0;
            if (delta)
                this.update( delta < 0 );
            event.stopPropagation();
            event.preventDefault();
        },

        update: function(zoomOut){
            this.zoomIndex = this.zoomIndex + (zoomOut ? -1 : + 1);
            this.zoomIndex = Math.max( 0, Math.min( this.zoomIndex, this.zooms.length-1) );

            this.$img.css('width', this.zooms[this.zoomIndex]+'%');
            var isMin = this.zoomIndex == 0;
            var isMax = this.zoomIndex == this.zooms.length-1;

            this.$zoomOutButton.attr('disabled', isMin).toggleClass('disabled', isMin);
            this.$zoomInButton.attr('disabled', isMax).toggleClass('disabled', isMax);
         }
    };


    /**********************************************************
    bsModalFile( fileName, options )
    **********************************************************/
    $.bsModalFile = function( fileName, options ){
        options = options || {};
        fileName = $._bsAdjustText(fileName);
        var theFileName = i18next.sentence(fileName),
            fileNameExt = window.url('fileext', theFileName),
            $content,
            footer = {
                da: 'Hvis filen ikke kan vises, klik på <i class="fas ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                en: 'If the file doesn\'t show correctly click on <i class="fas ' + $.bsExternalLinkIcon + '"/> to see the document in a new Tab Page'
            },
            fullWidth       = true,
            noPadding       = true,
            scroll          = false,
            alwaysMaxHeight = true;

        fileNameExt = fileNameExt ? fileNameExt.toLowerCase() : 'unknown';

        //Check for ext == 'pdf' and support for pdf
        if ((fileNameExt == 'pdf') && !window.PDFObject.supportsPDFs){
            $content =
                $('<div/>')
                    .addClass('text-center')
                    ._bsAddHtml({text: {
                        da: 'Denne browser understøtter ikke visning<br>af pdf-filer i popup-vinduer<br>Klik på <i class="fas ' + $.bsExternalLinkIcon + '"/> for at se dokumentet i en ny fane',
                        en: 'This browser does not support<br>pdf-files in popup windows<br>Click on <i class="fas ' + $.bsExternalLinkIcon + '"/> to see the document<br>in a new Tab page'
                    }});
            fullWidth       = false;
            footer          = null;
            noPadding       = false;
            alwaysMaxHeight = false;

        }
        else {
            switch (fileNameExt){
                //*********************************************
                case 'pdf':
                    //passes a jQuery object (HTML node) for target
                    $content = $('<div/>').addClass('object-with-file');
                    window.PDFObject.embed(
                        theFileName,
                        $content,
                        { pdfOpenParams: { view: 'FitH' } }
                    );
                    break;

                //*********************************************
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'png':
                case 'tiff':
                case 'bmp':
                case 'ico':
                    var $iframe =
                            $('<iframe></iframe>')
                                .addClass('object-with-file'),
                        $img =
                            $('<img src="' + theFileName + '"/>')
                                .css('width', '100%');

                    //Create a ZoomControl to zoom in and out
                    var zoomControl = new ZoomControl( $img );

                    //Add the images to the iframe when the iframe is loaded into the DOM
                    setTimeout( function(){
                        var $iFrameBody = $iframe.contents().find('body');
                        $iFrameBody.on('mousewheel', $.proxy( zoomControl.mousewheel, zoomControl ) );
                        $iFrameBody.append($img);
                    }, 200);


                    $content = [
                        $iframe,
                        $('<div></div>')
                            .addClass('modal-footer')
                            .css('justify-content',  'center')
                            ._bsAppendContent( zoomControl.getButtons() )
                    ];

                    scroll = false;
                    break;

                //*********************************************
                case 'html':
                case 'unknown':
                    $content = $('<iframe src="' + theFileName + '"/>').addClass('object-with-file');
                    break;

                //*********************************************
                default:
                    //Try default <object> to display the file
                    $content = $('<object data="' + theFileName + '"/>').addClass('object-with-file');

            } //end of switch (fileNameExt){...
        }

        //Create the bsModal
        return $.bsModal({
                    header    : options.header,
                    scroll    : scroll,
                    flexWidth : fullWidth,
                    megaWidth : fullWidth,

                    noVerticalPadding  : noPadding,
                    noHorizontalPadding: noPadding,
                    alwaysMaxHeight    : alwaysMaxHeight,

                    buttons   : [{text: {da: 'Åbne', en: 'Open'}, icon: $.bsExternalLinkIcon, link: fileName }],
                    content   : $content,
                    footer    : footer

               });
    };

}(jQuery, this.i18next, this, document));
;
/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        header
        modalContentClassName
        icons: {
            close   : {onClick, attr, className, attr, data }
            extend  : {onClick, attr, className, attr, data }
            diminish: {onClick, attr, className, attr, data }
}       type //"", "alert", "success", "warning", "error", "info"
        fixedContent

        alwaysMaxHeight
        flexWidth
        extraWidth
        megaWidth
        noVerticalPadding
        noHorizontalPadding
        content
        scroll: boolean | 'vertical' | 'horizontal'
        extended: {
            type
            fixedContent
            noVerticalPadding
            noHorizontalPadding
            alwaysMaxHeight
            content
            scroll: boolean | 'vertical' | 'horizontal'
            footer
        }
        isExtended: boolean
        footer
        buttons = [];
        closeIcon
        closeText
        noCloseIconOnHeader

    **********************************************************/
    var modalId = 0,
        openModals = 0,
        modalVerticalMargin = 10; //Top and bottom margin for modal windows

    /**********************************************************
    MAX-HEIGHT ISSUES ON SAFARI (AND OTHER BROWSER ON IOS)
    Due to an intended design in Safari it is not possible to
    use style a la max-height: calc(100vh - 20px) is not working
    as expected/needed
    Instead a resize-event is added to update the max-height of
    elements with the current value of window.innerHeight
    Sets both max-height and haight to allow always-max-heigth options
    **********************************************************/
    function adjustModalMaxHeight( $modalContent ){
        $modalContent = $modalContent || $('.modal-content.modal-flex-height');
        var maxHeight = parseInt(window.innerHeight) - 2*modalVerticalMargin;
        $modalContent.css({
            'max-height': maxHeight+'px',
            'height'    : maxHeight+'px'
        });
    }

    window.addEventListener('resize',            function(){ adjustModalMaxHeight(); }, false );
    window.addEventListener('orientationchange', function(){ adjustModalMaxHeight(); }, false );

    /******************************************************
    The height of a modal can be tre different modes
    1: max-height is adjusted to window-height. Default
    2: max-height. options.maxHeight
    3: fixed height. options.height

    The width of a modal is by default 300px.
    options.flexWidth :  If true the width of the modal will adjust to the width of the browser up to 500px
    options.extraWidth:  Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 800px
    options.megaWidth :  Only when flexWidth is set: If true the width of the modal will adjust to the width of the browser up to 1200px
    options.width     : Set if different from 300

    ******************************************************/
    function getHeightFromOptions( options ){
        if (options.height)    return {height   : options.height+'px',    maxHeight: null};
        if (options.maxHeight) return {maxHeight: options.maxHeight+'px', height   : 'auto'};
        return null;
    }

    function getWidthFromOptions( options ){
        return {
            flexWidth : !!options.flexWidth,
            extraWidth: !!options.extraWidth,
            megaWidth: !!options.megaWidth,
            width     : options.width ? options.width+'px' : null
        };
    }

    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {
        //Close all popover
        $('.popover.show').popover('hide');

        var $this = $(this);

        openModals++;

        //Move up the backdrop
        $._addModalBackdropLevel();

        //Add layer for noty on the modal
        $._bsNotyAddLayer();

        //Move the modal to the front
        $this._setModalBackdropZIndex();

        //Prevent the modal from closing with esc if there are a modal noty
        $(this).keydown( function( event ){
            if (window._bsNotyModal){
                window._bsNotyModal.close();
                event.stopImmediatePropagation();
                return false;
            }
        });
    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        //Focus on focus-element
        var $focusElement = $(this).find('.init_focus').last();
        if ($focusElement.length){
            document.activeElement.blur();
            $focusElement.focus();
        }
    }

    //******************************************************
    //hide_bs_modal - called when a modal is closing
    function hide_bs_modal() {
        //Never close pinned modals
        if (this.bsModal.isPinned)
            return false;

        //Remove all noty added on the modal and move down global backdrop
        $._bsNotyRemoveLayer();
    }

    //******************************************************
    //hidden_bs_modal - called when a modal is closed/hidden
    function hidden_bs_modal( /*event*/ ) {
        openModals--;
        if (openModals){
            //Move focus to previous modal on top
            var $modal = $('.modal.show').last(),
                $nextFocus = $modal.find('.init_focus');

            if ($nextFocus.length)
                $nextFocus.focus();
            else
                $modal.focus();

            //Re-add class "modal-open" to body (it is removed by Bootstrap)
            $('body').addClass('modal-open');
        }
    }

    /******************************************************
    prototype for bsModal
    ******************************************************/
    var bsModal_prototype = {

        show  : function(){
                    this.modal('show');

                    this.data('bsModalDialog')._bsModalSetHeightAndWidth();

                    if (this.bsModal.onChange)
                        this.bsModal.onChange( this.bsModal );
                },
        _close: function(){ this.modal('hide'); },

        close: function(){

            //If onClose exists => call and check
            if (this.onClose && !this.onClose())
                return false;

            //If pinable and pinned => unpin
            if (this.bsModal.isPinned)
                this._bsModalUnpin();

            this._close();
        },

        assignTo: function( $element ){
            $element.attr({
                'data-toggle': 'modal',
                'data-target': '#'+this.attr('id')
            });
        },

        getHeaderIcon: function(id){
            return this.find('[data-header-icon-id="'+id+'"]');
        },

        setHeaderIconEnabled: function(id, disabled){
            this.getHeaderIcon(id).toggleClass('disabled', !!disabled);
        },

        setHeaderIconDisabled: function(id){
            this.setHeaderIconEnabled(id, true);
        }
    };

    /******************************************************
    _bsModalBodyAndFooter
    Create the body and footer content (exc header and bottoms)
    of a modal inside this. Created elements are saved in parts
    ******************************************************/
    $.fn._bsModalBodyAndFooter = function(options, parts, className, noClassNameForFixed, noClassNameForFooter){
        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            isTabs          = !!(options && options.content && (options.content.type == 'tabs')),
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll;

        //Remove padding if the content is tabs and content isn't created from bsModal - not pretty :-)
        if (isTabs)
            className = className + ' no-vertical-padding no-horizontal-padding';

        //Append fixed content (if any)
        var $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed ' + (noClassNameForFixed ? '' : className) + (hasScroll ? ' scrollbar-'+scrollDirection : ''))
                    .appendTo( this );
        if (options.fixedContent)
            $modalFixedContent._bsAddHtml( options.fixedContent, true );

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .toggleClass('modal-body-always-max-height', !!options.alwaysMaxHeight)
                    .toggleClass('modal-type-' + options.type, !!options.type)
                    .appendTo( this );

        if (!options.content || (options.content === {}))
            $modalBody.addClass('modal-body-no-content');

        var $modalContent = parts.$content =
                hasScroll ?
                    $modalBody.addScrollbar({ direction: scrollDirection }) :
                    $modalBody;


        //Add sreoll-event to close any bootstrapopen -select
        if (hasScroll)
            $modalBody.on('scroll', function(){
                $modalContent.find('.dropdown.bootstrap-select select')._bsSelectBoxClose();
            });


        //Add content
        $modalContent._bsAppendContent( options.content, options.contentContext );

        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('modal-footer-header ' + (noClassNameForFooter ? '' : className))
                    .appendTo( this )
                    ._bsAddHtml( options.footer === true ? '' : options.footer );
        return this;
    };

    /******************************************************
    _bsModalSetHeightAndWidth - Set the height and width according to current cssHeight and cssWidth
    ******************************************************/
    $.fn._bsModalSetHeightAndWidth = function(){
        var bsModal = this.bsModal,
            $modalContent = bsModal.$modalContent,
            $modalDialog = $modalContent.parent(),
            isExtended = $modalContent.hasClass('modal-extended'),
            cssHeight = isExtended ? bsModal.cssExtendedHeight : bsModal.cssHeight,
            cssWidth = isExtended ? bsModal.cssExtendedWidth : bsModal.cssWidth;

        //Set height
        $modalContent
            .toggleClass('modal-fixed-height', !!cssHeight)
            .toggleClass('modal-flex-height', !cssHeight)
            .css( cssHeight ? cssHeight : {height: 'auto', maxHeight: null});
        if (!cssHeight)
            adjustModalMaxHeight( bsModal.$modalContent );

        //Set width
        $modalDialog
            .toggleClass('modal-flex-width', cssWidth.flexWidth )
            .toggleClass('modal-extra-width', cssWidth.extraWidth )
            .toggleClass('modal-mega-width', cssWidth.megaWidth )
            .css('width', cssWidth.width );

        //Call onChange (if any)
        if (bsModal.onChange)
            bsModal.onChange( bsModal );
    };

    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggleHeight
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function( event ){
        if (this.bsModal.$modalContent.hasClass('no-modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalDiminish = function( event ){
        if (this.bsModal.$modalContent.hasClass('modal-extended'))
            this._bsModalToggleHeight( event );
    };
    $.fn._bsModalToggleHeight = function( event ){
        this.bsModal.$modalContent.modernizrToggle('modal-extended');

        this._bsModalSetHeightAndWidth();

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };

/* TODO: animate changes in height and width
       var $this = this.bsModal.$container,
            oldHeight = $this.outerHeight(),
            newHeight;

        $this.modernizrToggle('modal-extended');

        newHeight = $this.outerHeight();
        $this.height(oldHeight);

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });
*/

    /******************************************************
    _bsModalPin, _bsModalUnpin, _bsModalTogglePin
    Methods to change pinned-status
    ******************************************************/
    $.fn._bsModalPin = function( event ){
        if (!this.bsModal.isPinned)
            this._bsModalTogglePin( event );
    };
    $.fn._bsModalUnpin = function( event ){
        if (this.bsModal.isPinned)
            this._bsModalTogglePin( event );
    };
    $.fn._bsModalTogglePin = function( event ){
        var $modalContent = this.bsModal.$modalContent;
        this.bsModal.isPinned = !this.bsModal.isPinned;
        $modalContent.modernizrToggle('modal-pinned', !!this.bsModal.isPinned);
        this.bsModal.onPin( this.bsModal.isPinned );

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };



    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.bsModal
    ******************************************************/
    $.fn._bsModalContent = function( options ){
        options = options || {};

        //this.bsModal contains all created elements
        this.bsModal = {};

        this.bsModal.onChange = options.onChange || null;

        //Set bsModal.cssHeight and (optional) bsModal.cssExtendedHeight
        this.bsModal.cssHeight = getHeightFromOptions( options );
        if (options.extended){
            if (options.extended.height == true)
                this.bsModal.cssExtendedHeight = this.bsModal.cssHeight;
            else
                this.bsModal.cssExtendedHeight = getHeightFromOptions( options.extended );
        }

        //Set bsModal.cssWidth and (optional) bsModal.cssExtendedWidth
        this.bsModal.cssWidth = getWidthFromOptions( options );
        if (options.extended){
            //If options.extended.width == true or none width-options is set in extended => use same width as normal-mode
            if ( (options.extended.width == true) ||
                 ( (options.extended.flexWidth == undefined) &&
                   (options.extended.extraWidth == undefined) &&
                   (options.extended.megaWidth == undefined) &&
                   (options.extended.width == undefined)
                 )
              )
                this.bsModal.cssExtendedWidth = this.bsModal.cssWidth;
            else
                this.bsModal.cssExtendedWidth = getWidthFromOptions( options.extended );
        }


        var $modalContent = this.bsModal.$modalContent =
                $('<div/>')
                    .addClass('modal-content')
                    .addClass(options.modalContentClassName)
                    .modernizrToggle('modal-extended', !!options.isExtended )

                    .toggleClass('modal-content-always-max-height',          !!options.alwaysMaxHeight)
                    .toggleClass('modal-extended-content-always-max-height', !!options.extended && !!options.extended.alwaysMaxHeight)

                    .modernizrOff('modal-pinned')
                    .appendTo( this );



        this._bsModalSetHeightAndWidth();

        var modalExtend       = $.proxy( this._bsModalExtend,       this),
            modalDiminish     = $.proxy( this._bsModalDiminish,     this),
            modalToggleHeight = $.proxy( this._bsModalToggleHeight, this),

            modalPin          = $.proxy( this._bsModalPin,          this),
            modalUnpin        = $.proxy( this._bsModalUnpin,        this);


        this.bsModal.onPin = options.onPin;
        this.bsModal.isPinned = false;

        options = $.extend( true, {
            headerClassName     : 'modal-header',
            //Buttons
            buttons             : [],
            closeButton         : true,
            closeText           : {da:'Luk', en:'Close'},
            closeIcon           : 'fa-times',
            noCloseIconOnHeader : false,

            //Icons
            icons    : {
                pin     : { className: 'hide-for-modal-pinned',   onClick: options.onPin    ? modalPin      : null },
                unpin   : { className: 'show-for-modal-pinned',   onClick: options.onPin    ? modalUnpin    : null },
                extend  : { className: 'hide-for-modal-extended', onClick: options.extended ? modalExtend   : null, altEvents:'swipeup'   },
                diminish: { className: 'show-for-modal-extended', onClick: options.extended ? modalDiminish : null, altEvents:'swipedown' },
                new     : { className: '',                        onClick: options.onNew    ? $.proxy(options.onNew, this) : null },
            }
        }, options );

        //Adjust for options.buttons: null
        options.buttons = options.buttons || [];

        //Hide the close icon on the header
        if (options.noCloseIconOnHeader && options.icons && options.icons.close)
            options.icons.close.hidden = true;

        //Add close-botton at beginning. Avoid by setting options.closeButton = false
        if (options.closeButton)
            options.buttons.unshift({
                text: options.closeText,
                icon: options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        /*
        If the modal has extended content and neither normal or extended content is tabs =>
            Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        */
        if (options.content && (options.content.type != "tabs") && options.extended && (options.extended.content.type != "tabs")){
            options.scroll = options.scroll || options.extended.scroll;
            options.extended.scroll = options.scroll;
        }

        //Append header
        if (!options.noHeader &&  (options.header || !$.isEmptyObject(options.icons) ) ){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        ._bsHeaderAndIcons( options )
                        .appendTo( $modalContent );

            //Add dbl-click on header to change to/from extended
            if (options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggleHeight );
        }
        else
            $modalContent.addClass('no-modal-header');

        //If options.extended.fixedContent == true and/or options.extended.footer == true => normal and extended uses same fixed and/or footer content
        var noClassNameForFixed = false,
            noClassNameForFooter = false;
        if (options.extended) {
            //If common fixed content => add it as normal fixed content
            if ((options.fixedContent === true) || (options.extended.fixedContent === true)) {
                noClassNameForFixed = true;
                options.fixedContent = options.extended.fixedContent === true ? options.fixedContent : options.extended.fixedContent;
                options.extended.fixedContent = '';
            }

            //If common footer content => add it as extended footer content
            if ((options.footer === true) || (options.extended.footer === true)) {
                noClassNameForFooter = true;
                options.extended.footer = options.extended.footer === true ? options.footer : options.extended.footer;
                options.footer = '';
            }
        }

        //Create normal content
        $modalContent._bsModalBodyAndFooter(options, this.bsModal, 'hide-for-modal-extended', noClassNameForFixed, false );

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};
            $modalContent._bsModalBodyAndFooter( options.extended, this.bsModal.extended, 'show-for-modal-extended', false, noClassNameForFooter );
        }

        //Add buttons (if any)
        var $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .toggleClass('modal-footer-vertical', !!options.verticalButtons)
                    .appendTo( $modalContent ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonClass = options.verticalButtons ? 'btn-block' : '',
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //If no button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        $.each( buttons, function( index, buttonOptions ){

            focusAdded = focusAdded || buttonOptions.focus;
            if (!focusAdded && (index+1 == buttons.length ) )
                buttonOptions.focus = true;

            //Add same onClick as close-icon if closeOnClick: true
            if (buttonOptions.closeOnClick)
                buttonOptions.equalIconId = (buttonOptions.equalIconId || '') + ' close';

            buttonOptions.class = defaultButtonClass + ' ' + (buttonOptions.className || '');

            var $button =
                $.bsButton( $.extend({}, defaultButtonOptions, buttonOptions ) )
                    .appendTo( $modalButtonContainer );

            //Add onClick from icons (if any)
            buttonOptions.equalIconId = buttonOptions.equalIconId || '';
            $.each( buttonOptions.equalIconId.split(' '), function( index, iconId ){
                if (iconId && options.icons[iconId] && options.icons[iconId].onClick)
                    $button.on('click', options.icons[iconId].onClick);
            });

            $modalButtons.push( $button );
        });
        return this;
    };

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){
        var $result, $modalDialog;

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal-dialog',
                class    : (options.noVerticalPadding   ? 'no-vertical-padding'    : '') +
                           (options.noHorizontalPadding ? ' no-horizontal-padding' : ''),

                //Header
                noHeader : false,

                //Size
                useTouchSize: true,

                //Content
                scroll     : true,
                content    : '',

                //Modal-options
                static     : false,
                show       : true
            });

        //Create the modal
        $result =
            $('<div/>')
                .addClass('modal')
                .attr({
                    'id'         : options.id || '_bsModal'+ modalId++,
                    'tabindex'   : -1,
                    'role'       : "dialog",
                    'aria-hidden': true
                });

        $modalDialog =
            $('<div/>')
                ._bsAddBaseClassAndSize( options )
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.extend( bsModal_prototype );

        //Add close-icon and create modal content
        options.icons = options.icons || {};
        options.icons.close = { onClick: $.proxy( bsModal_prototype.close, $result) };

        $modalDialog._bsModalContent( options );
        $result.data('bsModalDialog', $modalDialog);

        $result.onClose = options.onClose;

        //Create as modal and adds methods - only allow close by esc for non-static modal (typical a non-form)
        $result.modal({
           //Name       Value                                   Type                Default Description
           backdrop :   options.static ? "static" : true,   //  boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   !options.static,                    //  boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,                               //  boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false                               //  boolean	            true	Shows the modal when initialized.
        });
        $result.bsModal = $modalDialog.bsModal;
        $result.on({
            'show.bs.modal'  : show_bs_modal,
            'shown.bs.modal' : shown_bs_modal,
            'hide.bs.modal'  : $.proxy(hide_bs_modal, $result),
            'hidden.bs.modal': hidden_bs_modal,
        });

        $result.appendTo( $('body') );

        if (options.show)
            $result.show();

        return $result;
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-noty.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, Noty, window, document, undefined) {
	"use strict";


    /******************************************************
    To be able to have Noty on top of modal-windows the notys are
    placed in different containers with increasing and decreasing
    z-index.
    A new container is added when a modal-window or modal-noty is open
    All noty in the top container is closed when the modal-window or
    modal noty is closed. E.q. all noty opened on top of a modal-window is automatic
    closed when the modal-window is closed
    If options.onTop: true the noty is placed in a container that is allways on the top of other elements
    ******************************************************/

    var bsNotyLayerList   = [],
        $bsNotyLayer      = null,
        $bsNotyLayerOnTop = null;

    //Global pointer to current modal noty (if any)
    window._bsNotyModal = null;

    //Add global event-function to close modal-noty by pressing esc
    $(document).keydown( function( event ){
        if (window._bsNotyModal && (event.which == 27))
            window._bsNotyModal.close();
    });


    function notyQueueName(isOnTopLayer){
        return 'bsNotyQueue'+ (isOnTopLayer ? 'ONTOP' : bsNotyLayerList.length);
    }

    //$._bsNotyAddLayer: add a new container for noty-containers
    $._bsNotyAddLayer = function( isOnTopLayer, className ){

        var $result =
            $('<div/>')
                .addClass('noty-layer')
                .appendTo( $('body') );

        if (!isOnTopLayer)
            bsNotyLayerList.push( $result );

        $result
            .attr('id', notyQueueName( isOnTopLayer ))
            ._setModalBackdropZIndex( isOnTopLayer, className );

        if (isOnTopLayer)
            $bsNotyLayerOnTop = $result;
        else
            $bsNotyLayer = $result;
    };


    //$._bsNotyRemoveLayer: close all noty in current layer and remove the layer
    $._bsNotyRemoveLayer = function(){
        //Close all noty in current layer
        Noty.closeAll(notyQueueName());

        //Remove the layer
        bsNotyLayerList.pop().remove();

        $bsNotyLayer = bsNotyLayerList[ bsNotyLayerList.length - 1];

        //Move down or hide the backdrop
        $._removeModalBackdropLevel( true );
    };


    /******************************************************
    Extend Noty with flash
    Turn flashing on for 3s
    ******************************************************/
    Noty.prototype.flash  = function(){
        var $barDom = $(this.barDom);
        if ($barDom.hasClass('flash')){
            //Restart thr animation
            //Thank to https://css-tricks.com/restart-css-animation/
            $barDom.removeClass('flash');
            void $barDom.find('.noty_body').get(0).offsetWidth;
            $barDom.addClass('flash');
        }
        else
            $barDom.addClass('flash');
        return this;
    };

    /******************************************************
    Setting default options for Noty
    ******************************************************/
    Noty.overrideDefaults({
        theme: 'jquery-bootstrap'
    });


    var defaultNotyOptions = {
        layout   : 'topCenter',
        type     : 'info',
        closeWith: ['click'],
        textAlign: 'left',
        onTop    : false,
        show     : true,
    };


    $.bsNoty = function(options){
        options = $.extend({}, defaultNotyOptions, options );

        if (options.type == 'information')
            options.type = 'info';

        //Set animation from layout
        var animateOpen = 'fadeIn',
            animateClose = 'fadeOut';
        if (options.layout.indexOf('top') == 0){
            //top, topLeft, topCenter, topRight
            animateOpen  = 'fadeInDown';
            animateClose = 'fadeOutUp';
        }
        else
        if (options.layout.indexOf('bottom') == 0){
            //bottom, bottomLeft, bottomCenter, bottomRight
            animateOpen  = 'fadeInUp';
            animateClose = 'fadeOutDown';
        }
        else
        if (options.layout == 'centerLeft'){
            //centerLeft
            animateOpen  = 'fadeInLeft';
            animateClose = 'fadeOutLeft';
        }
        else
        if (options.layout == 'centerRight'){
            //centerRight
            animateOpen  = 'fadeInRight';
            animateClose = 'fadeOutRight';
        }
        else
        if (options.layout == 'center'){
            //centerRight
            animateOpen  = 'fadeIn';
            animateClose = 'fadeOut';
        }

        if (options.animation == undefined)
            options.animation = {
                open : 'animated ' + animateOpen,
                close: 'animated ' + animateClose
            };

        //Save buttons and remove if from options to prevent default buttons
        var buttons = options.buttons;
        options.buttons = null;

        //Save closeWith and remove 'button' to prevent default close-button
        var closeWith = options.closeWith,
            closeWithButton = closeWith.indexOf('button') >= 0,
            closeWithClick = closeWith.indexOf('click') >= 0,
            headerOptions = null;

        //Adjust closeWith
        if (options.buttons)
            closeWithClick = false;

        //Set options.closeWith with not-empty content to allow closing by other notys
        options.closeWith = closeWithClick ? ['click'] : closeWithButton ? ['NoEmpty'] : [];


        //Save show and create the noty hidden
        var show = options.show;
        options.show = false;

        //Create the noty empty and create the content in options.content
        options.content = options.content || $._bsAdjustIconAndText(options.text);
        options.text = '';

        //Add header (if any)
        if (options.header || options.defaultHeader){
            if (!$.isArray(options.content))
                options.content = [options.content];

            options.header = $._bsAdjustIconAndText(options.header) || {};

            headerOptions =
                options.defaultHeader ?
                $.extend({},
                    {
                        icon: $.bsNotyIcon[options.type],
                        text: $.bsNotyName[options.type]
                    }, options.header || {})
                : options.header || {};
        }

        //Force no progressBar
        options.progressBar = false;

        //Always force when modal
        options.force = options.force || options.modal;

        //Add callbacks.onTemplate to add content (and close-icon)
        options.callbacks = options.callbacks || {};
        options.callbacks.onTemplate = function() {
            var _this           = this,
                $barDom         = $(this.barDom),
                $body           = $barDom.find('.noty_body'),
                closeFunc       = function( event ){
                                      event.stopPropagation();
                                      _this.close();
                                   },
                headerClassName = 'noty-header ' + $._bsGetSizeClass({ useTouchSize: true, baseClass: 'noty-header'} ),
                icons           = {close: { onClick: closeFunc } };

            //Insert header before $body (if any)
            if (headerOptions)
                $('<div/>')
                    ._bsHeaderAndIcons({
                        headerClassName: headerClassName,
                        header         : headerOptions,
                        icons          : closeWithButton ? icons : null
                    })
                    .insertBefore( $body );
            else
                $barDom.addClass('no-header');

            //Replace content with text as object {icon, txt,etc}
            $body._bsAddHtml( options.content, true );
            $body.addClass('text-'+options.textAlign);

            //Add buttons (if any)
            if (buttons){
                var $buttonContainer =
                        $('<div/>')
                            .addClass('noty-buttons modal-footer')  //modal-footer from Bootstrap also used in modal-windows for button-container
                            .insertAfter($body),
                    defaultButtonOptions = {
                        closeOnClick: true
                    };

                $.each( buttons, function( index, buttonOptions ){
                    buttonOptions = $.extend(true, defaultButtonOptions, buttonOptions );
                    var $button = $.bsButton(buttonOptions).appendTo($buttonContainer);
                    if (buttonOptions.closeOnClick)
                        $button.on('click', closeFunc );
                });
            }

            //Add footer (if any)
            if (options.footer){
                $('<div/>')
                    .addClass('noty-footer')
                    .addClass('text-' + (options.footer.textAlign || 'left'))
                    ._bsAddHtml( options.footer )
                    .insertAfter($body);
            }

            if (!headerOptions && closeWithButton)
                //Add same close-icon as for modal-windows
                $('<div/>')
                    .css('display', 'contents')
                    .appendTo( $barDom )
                    ._bsHeaderAndIcons({
                        inclHeader     : false,
                        headerClassName: headerClassName,
                        icons          : icons
                    });
        };


        var $bsNotyLayerToUse; //The noty-layer to contain the noty

        //If it is a modal noty => add/move up backdrop
        if (options.modal)
            $._addModalBackdropLevel();

        //Find or create layer and container for the noty
        if (options.onTop){
            if (!$bsNotyLayerOnTop)
                $._bsNotyAddLayer(true, options.onTopLayerClassName);
            $bsNotyLayerToUse = $bsNotyLayerOnTop;
        }
        else {
            if (!$bsNotyLayer || options.modal)
                $._bsNotyAddLayer();
            $bsNotyLayerToUse = $bsNotyLayer;
        }

        var classNames = '.noty-container.noty-container-'+options.layout,
            $container = $bsNotyLayerToUse.find(classNames);
        if (!$container.length){
            $container =
                $('<div/>')
                    .addClass( classNames.split('.').join(' ') )
                    .appendTo( $bsNotyLayerToUse );
        }

        options.container = '#' + notyQueueName(options.onTop) + ' ' + classNames;

        var result = new Noty( options );

        //If options.flash => flash on show
        if (options.flash)
            result.on('onShow', result.flash, result );


        //If it is a modal noty => remove/move down backdrop when closed
        if (options.modal){
            result.on('afterClose', $._bsNotyRemoveLayer);

            result.on('onShow', function(){
                this.prevBsNotyModal = window._bsNotyModal;
                window._bsNotyModal = this;
            });
            result.on('afterClose', function(){
                window._bsNotyModal = this.prevBsNotyModal;
            });

    }


        if (show)
            result.show();

        return result;
    };


    /********************************************************************
    *********************************************************************
    Create standard variations of bsNoty:
    notySuccess/notyOk, notyError, notyWarning, notyAlert, notyInfo (and dito $bsNoty[TYPE]
    The following default options is used
    queue: "global" but if != "global" options.killer is set to options.queue
    killer: if options.queue != "global" => killer = queue and the noty will close all noty with same queue.
            To have unique queue and prevent closing: set options.killer: false
            To close all noty set options.killer: true
    timeout: If type="warning" or "success" timeout is set to 3000ms. Can be avoided by setting options.timeout: false
    defaultHeader: If type = "error": defaultHeader = true
    textAlert: left if any header else center
    closeWith: if the noty has buttons then only button else only click
    *********************************************************************
    *********************************************************************/
    //$.bsNotyIcon = icon-class for different noty-type
    $.bsNotyIcon = {
        info        : 'fa-info-circle',
        information : 'fa-info-circle',
        alert       : '',
        success     : 'fa-check',
        error       : 'fa-ban',
        warning     : 'fa-exclamation-triangle',
        help        : 'fa-question-circle'
    };

    //$.bsNotyName = Name for different noty-type
    $.bsNotyName = {
        info        : {da:'Information', en:'Information'},
        information : {da:'Information', en:'Information'},
        alert       : {da:'Bemærk', en:'Note'},
        success     : {da:'Succes', en:'Success'},
        error       : {da:'Fejl', en:'Error'},
        warning     : {da:'Advarsel', en:'Warning'},
        help        : {da:'Hjælp', en:'Help'}
    };



    /***************************************************************
    window.notyDefault
    Noty with default options as descried above
    ****************************************************************/
    function notyDefault( type, text, options ){
        options = options || {};

        options.type = type;

        options.content = $._bsAdjustIconAndText( text );

        //Set killer
        if (options.queue && (options.killer !== false) && (options.killer !== true))
            options.killer = options.queue;

        //Set timeout
        if ( ((options.type == 'warning') || (options.type == 'success')) && !options.buttons && (!options.timeout || (options.timeout !== false)) )
            options.timeout = options.timeout || 3000;
        options.force = options.force || (options.timeout);

        //defaultHaeder
        options.defaultHeader = !options.header && (options.defaultHeader || ((options.type == 'error') && (options.defaultHeader !== false)));

        //text-align: center if no header
        options.textAlign = options.textAlign || (options.header || options.defaultHeader ? 'left' : 'center');

        //Set closeWith
        options.closeWith = options.closeWith || (options.buttons ? ['button'] : ['click']);

        return $.bsNoty( options );

    }

    /***************************************************************
    window.notySuccess / $.bsNotySuccess / window.notyOk / $.bsNotyOk
    Simple centered noty with centered text
    ****************************************************************/
    window.notySuccess = $.bsNotySuccess = window.notyOk = $.bsNotyOk = function( text, options ){
        return  notyDefault(
                    'success',
                    {icon: $.bsNotyIcon['success'], text: text},
                    $.extend( options || {}, {layout: 'center'})
                );
    };

    /***************************************************************
    window.notyError / $.bsNotyError: Simple error noty with header
    ****************************************************************/
    window.notyError = $.bsNotyError = function( text, options ){
        return  notyDefault( 'error', text, options );
    };

    /***************************************************************
    window.notyWarning / $.bsNotyWarning: Simple warning noty with header
    ****************************************************************/
    window.notyWarning = $.bsNotyWarning = function( text, options ){
        return  notyDefault( 'warning', text, options );
    };

    /***************************************************************
    window.notyAlert / $.bsNotyAlert: Simple alert noty with header
    ****************************************************************/
    window.notyAlert = $.bsNotyAlert = function( text, options ){
        return  notyDefault( 'alert', text, options );
    };

    /***************************************************************
    window.notyInfo / $.bsNotyInfo: Simple info noty with header
    ****************************************************************/
    window.notyInfo = $.bsNotyInfo = function( text, options ){
        return  notyDefault( 'info', text, options );
    };

    /***************************************************************
    window.notyHelp / $.bsNotyHelp: Simple help noty with header
    ****************************************************************/
    window.notyHelp = $.bsNotyHelp = function( text, options ){
        return  notyDefault( 'help', text, options );
    };



    /******************************************************************************
    window.noty: Replacing window.noty from noty^2.4.1 that was removed in noty^3
    *******************************************************************************/
    window.noty = function( options ){
        return $.bsNoty($.extend({}, {
            content: options.text || options.content,
            show   : true
        }, options));
    };

}(jQuery, this.Noty, this, document));
;
/****************************************************************************
	jquery-bootstrap-popover.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /**********************************************************
    To sequre that all popovers are closed when the user click or
    tap outside the popover the following event are added
    **********************************************************/
    var popoverClassName = 'hasPopover';

    $('body').on("touchstart mousedown", function( event ){
        $('.'+popoverClassName).each(function () {
            var $this = $(this);
            // hide any open popover when the anywhere else in the body is clicked
            if (!$this.is(event.target) && $this.has(event.target).length === 0 && $('.popover').has(event.target).length === 0)
                $this.popover('hide');
        });
    });

    /***********************************************************
	Extend the $.fn.popover.Constructor.prototype.setContent to
    also construct footer
	***********************************************************/
    var Selector = {
        FOOTER: '.popover-footer'
    };

    $.fn.popover.Constructor.prototype.setContent = function (setContent) {
		return function () {

            //Add footer content
            var $tip = $(this.getTipElement());
            this.setElementContent($tip.find(Selector.FOOTER), this.config.footer);

            //Original function/method
            setContent.apply(this, arguments);
		};
	} ($.fn.popover.Constructor.prototype.setContent);


    /**********************************************************
    bsPopover( options ) - create a Bootstrap-popover
    options
        header      : See jquery-bootstrap-header.js
        close       : [Boolean] - show close cross in header
        trigger     : [String] 'click'	How popover is triggered - click | hover | focus | manual
        vertical    : [Boolean]
        closeOnClick: [Boolean] false - if true the popover will close when it is clicked
        placement   : [String] "top", "bottom", "left", "right". Default = 'right' for vertical: false and 'top' for vertical:true
        content     : The content (function, DOM-element, jQuery-object)
        footer      : {icon, text, link, title} or [] of {icon, text, link, title}
    **********************************************************/
    $.fn.bsPopover = function( options ){
        options = $._bsAdjustOptions( options );

        var $this = $(this),
            $header = '';

        //Add header (if any)
        if (options.header || options.close){
            options.icons = options.icons || {};
            options.headerClassName = 'popover-header-content';
            if (options.close)
                options.icons.close = {
                    onClick: function(){ $this.popover('hide'); }
                };

            $header =
                $('<div/>')
                    ._bsHeaderAndIcons( options );
        }

        var popoverOptions = {
                trigger  :  options.trigger || 'click', //or 'hover' or 'focus' ORIGINAL='click'
                //delay    : { show: 0, hide: 1000 },
                toggle   :  options.toggle || 'popover',
                html     :  true,
                placement:  options.placement || (options.vertical ? 'top' : 'right'),
                container:  'body',
                template :  '<div class="popover ' + (options.small ? ' popover-sm' : '') + '" role="tooltip">'+
                                '<div class="popover-header"></div>' +
                                '<div class="popover-body"></div>' +
                                '<div class="popover-footer"></div>' +
                                '<div class="arrow"></div>' +
                            '</div>',

                title    : $header,
                content  : options.content,
                footer   : options.footer ? $('<div/>')._bsAddHtml( options.footer ) : ''
            };
        if (options.delay)
            popoverOptions.delay = options.delay;

        return this.each(function() {
            var $this = $(this);

            $this.addClass( popoverClassName );

            //This event fires immediately when the show instance method is called.
            $this.on('show.bs.popover', popover_onShow );

            //This event is fired when the popover has been made visible to the user (will wait for CSS transitions to complete).
            $this.on('shown.bs.popover', popover_onShown );

            //This event is fired immediately when the hide instance method has been called.
            $this.on('hide.bs.popover', popover_onHide );

            //This event is fired when the popover has finished being hidden from the user (will wait for CSS transitions to complete).
            $this.on('hidden.bs.popover', popover_onHidden );

            $this.data('popover_options', options);
            $this.popover( popoverOptions );

            if (options.postCreate)
              options.postCreate( options.content );

        });
    };

    function popover_onShow(){
    }

    function popover_onShown(){
        //Find the popover-element. It has id == aria-describedby
        var $this = $(this),
            popoverId = $this.attr('aria-describedby'),
            options = $this.data('popover_options');

        this._$popover_element = popoverId ? $('#' + popoverId) : null;
        if (this._$popover_element){

            //Translate content
            this._$popover_element.localize();

            //Close the popup when anything is clicked
            if (options.closeOnClick){
                this._$popover_element.on('click.bs.popover', function(){
                    $this.popover('hide');
                });
            }
        }
    }

    function popover_onHide(){
        if (this._$popover_element)
            this._$popover_element.off('click.bs.popover mousedown.bs.popover');
    }

    function popover_onHidden(){
        //Reset this._$popover_element
        this._$popover_element = null;
    }




    /**********************************************************
    bsButtonGroupPopover( options ) - create a Bootstrap-popover with buttons
    **********************************************************/
    $.fn.bsButtonGroupPopover = function( options, isSelectList ){
        var $content = isSelectList ? $.bsSelectList( options ) : $.bsButtonGroup( options );

        if (isSelectList)
            this.data('popover_radiogroup', $content.data('selectlist_radiogroup') );

        return this.bsPopover(  $.extend( options, { content:  $content }) );
    };


    /**********************************************************
    bsRadioButtonPopover( options ) - create a Bootstrap-popover with radio-buttons
    **********************************************************/
    $.fn.bsSelectListPopover = function( options ){
        return this.bsButtonGroupPopover( $.extend({}, options, {
                        postOnChange : $.proxy( selectListPopover_postOnChange, this ),
                        postCreate   : $.proxy( selectListPopover_postCreate, this ),
                    }), true );
    };

    function selectListPopover_postCreate( content ){
        //Update this with the selected items html
        $.proxy( selectListPopover_postOnChange, this )( content.children('.active') );
    }

    function selectListPopover_postOnChange( $item ){
        var options = this.data('popover_options');
        if ($item && $item.length && options && options.syncHtml)
            //Update owner html to be equal to $item
            this.html( $item.html() );
    }

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-select.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsSelectbox based on
    bootstrap-select https://developer.snapappointments.com/bootstrap-select/


****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    //Setting defaults for bootstrap-select
    $.fn.selectpicker.Constructor.BootstrapVersion = '4';

    $.fn.selectpicker.Constructor.DEFAULTS = $.extend( $.fn.selectpicker.Constructor.DEFAULTS, {

    styleBase         : 'btn',
    style             : 'btn-standard',
        size: 'auto',
        selectedTextFormat: 'values',

        title: null,

    noneSelectedText: '', //'Er det denne her?',

    width             : '100%', //false,
    container         : 'body', //false,
        hideDisabled: false,
        showSubtext: false,
        showIcon   : true,
        showContent: true,
        dropupAuto: true,
        header: false,
        liveSearch: false,
        liveSearchPlaceholder: null,
        liveSearchNormalize: false,
        liveSearchStyle: 'contains',
        actionsBox: false,
        showTick: true,
    iconBase: $.FONTAWESOME_PREFIX, //'glyphicon',
    tickIcon: 'fa-ok',              //'glyphicon-ok',
    });

    //Sets max visible items in list to four if the screen is 'small'
    if ( Math.min(window.screen.width, window.screen.height) < 420 )
        $.fn.selectpicker.Constructor.DEFAULTS.size = 4;

    var selectboxId = 0;

    /**********************************************************
    bsSelectbox
    **********************************************************/
    $.bsSelectBox = $.bsSelectbox = function( options ){

        //Add size-class to button-class
        var buttonSizeClass = $._bsGetSizeClass({
                baseClass   : 'btn',
                small       : options.small,
                useTouchSize: true
            }),
            dropdownMenuSizeClass = $._bsGetSizeClass({
                baseClass   : 'dropdown-menu',
                small       : options.small,
                useTouchSize: true
            });

        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'btn',
                class       : '',
                style       : 'btn-standard ' + buttonSizeClass,
                useTouchSize: true,
                data: [],
            });

        //Convert placeholder (if any)
        if (options.placeholder){
            options.placeholder = $._bsAdjustIconAndText( options.placeholder );
            options.placeholder = $.extend(options.placeholder, {
                id   : -1,
                _text: options.placeholder.text,
                text : ''
            });
        }

        //Append items
        var selectedIdFound = false,

        //Create result and select-element
            $select =
                $('<select/>')
                    ._bsAddIdAndName( options ),
            $result =
                $('<div class="form-control-with-label"></div>')
                    .append( $select );

        //Convert options.items to select-option
        var $currentParent = $select;
        $.each( options.items, function( index, itemOptions ){
            if (itemOptions.id){
                if (itemOptions.id == options.selectedId)
                    selectedIdFound = true;
                $('<option/>')
                    .text(itemOptions.id)
                    .prop('selected', itemOptions.id == options.selectedId)
                    .appendTo($currentParent);
            }
            else
                $currentParent = $('<optgroup/>').appendTo($select);
        });

        //Create selectpicker
        var selectpicker = $select.selectpicker(options).data('selectpicker').selectpicker;
        selectpicker.bsOptions = options;

        //Set size-class for dropdown-menu
        $select.parent().find('.dropdown-menu').addClass(dropdownMenuSizeClass);

        //Update the content of the items with bsOptions
        var itemIndex = 0;
        $.each( selectpicker.main.data, function(index, data ){
            if ((data.type == 'option') || (data.type == 'optgroup-label')){
                var $elem = $(selectpicker.main.elements[index]),
                    $child = $elem.children().first();

                $child.empty();
                $child._bsAddHtml(options.items[itemIndex]);
                $elem.data('bsOptions', options.items[itemIndex] );

                options.items[itemIndex].elementIndex = index;
                options.items[itemIndex].$element = $elem;

                itemIndex++;
            }
        });

        //Replace default arrow with Chevrolet-style
        $('<i/>')
            .addClass('fa chevrolet')
            .appendTo( $select.parent().find('.filter-option-inner') );

        //wrap inside a label
        var $label = $result._wrapLabel({ label: options.label });

        //Open/close select when click on the label
        $label.on('click', function(event){
            $select.selectpicker('toggle');
            event.stopPropagation();
            return false;
        });

        //** Add events **

        //setLabelAsPlaceholder: Update label position
        function setLabelAsPlaceholder( showLabelAsPlaceholder ){
            if (typeof showLabelAsPlaceholder != 'boolean')
                showLabelAsPlaceholder = !$select.selectpicker('val');
            $result.toggleClass('show-label-as-placeholder', showLabelAsPlaceholder);
        }

        //Set events to update content and call onChange
        $select.on('changed.bs.select', function (/*e, clickedIndex, isSelected, previousValue*/) {
            var selectedIndex = $select[0].selectedIndex;

            if (selectedIndex != -1){
                var elementIndex = selectpicker.main.map.newIndex[selectedIndex],
                    options = $(selectpicker.main.elements[elementIndex]).data('bsOptions');

                selectpicker.$inner = selectpicker.$inner || $select.parent().find('.filter-option-inner-inner');

                selectpicker.$inner.empty();
                selectpicker.$inner._bsAddHtml(options);

                if (selectpicker.bsOptions.onChange)
                    selectpicker.bsOptions.onChange( options.id, true );
            }
            setLabelAsPlaceholder();
        });

        $select.on('show.bs.select', function(){ setLabelAsPlaceholder(false); });
        $select.on('hide.bs.select', function(){ setLabelAsPlaceholder();      });


        //Set selected item (id any)
        $select.selectpicker('val', selectedIdFound ? options.selectedId : null);

        return $label;
    };



    $.fn._bsSelectBoxClose = function(){
        var selectpicker = $(this).data('selectpicker');
        if (selectpicker && selectpicker.$menu.hasClass('show')){
            $(this).selectpicker('toggle');
        }

    };


}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-selectlist.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo


    bsSelectList( options ) - create a Bootstrap-list with selection

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    var selectlistId = 0;

    $.bsSelectList = $.bsSelectlist = function( options ){
        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectlist'+ selectlistId++,
                baseClass   : 'selectList',
                class       : '',
                useTouchSize: true
            });

        var $result =
                $('<div tabindex="0"/>')
                    ._bsAddIdAndName( options )
                    ._bsAddBaseClassAndSize( options ),
            radioGroup =
                $.radioGroup(
                    $.extend({}, options, {
                        radioGroupId     : options.id,
                        className        : 'active highlighted',
                        allowZeroSelected: false
                    })
                );

        $result.data('radioGroup', radioGroup);

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $(isItem ? '<a/>' : '<div/>');
            $item
                .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )
                .addClass( options.center ? 'text-center' : '')
                .appendTo( $result )
                ._bsAddHtml( itemOptions/*, true */);

            if (isItem)
                radioGroup.addElement( $item, itemOptions );
        });

        $result.data('selectlist_radiogroup', radioGroup);

        return $result;
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-table.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsTable( options )
options
    columns = [] of {
        id,
        header   :  {icon, text, link, textStyle} or [] of {text,...}
        vfFormat,
        vfOptions:  The content of a element can be set and updated using [jquery-value-format].
                    The options vfFormat and (optional) vfOptions defines witch format used to display the content

        align        : 'left','center','right'. Defalut = 'left'
        verticalAlign: 'top', 'middle','bottom'. Default = 'middle'
        noWrap       : false. If true the column will not be wrapped = fixed width
TODO:   truncate     : false. If true the column will be truncated. Normally only one column get truncate: true
        fixedWidth   : false. If true the column will not change width when the tables width is changed

        sortable     :  [boolean] false
        sortBy       : [string or function(e1, e2): int] "string". Possible values: "int" (sort as float), "moment", "moment_date", "moment_time" (sort as moment-obj) or function(e1, e2) return int
        sortIndex    : [int] null. When sorting and to values are equal the values from an other column is used.
                                   The default order of the other columns to test is given by the its index in options.columns. Default sortIndex is (column-index+1)*100 (first column = 100). sortIndex can be set to alter the order.
        sortDefault  : [string or boolean]. false. Possible values = false, true, "asc" or "desc". true => "asc"
        sortHeader   : [boolean] false. If true a header-row is added every time the sorted value changes

    }

    showHeader          [boolean] true
    verticalBorder      [boolean] true. When true vertical borders are added together with default horizontal borders
    noBorder            [boolean] false. When true no borders are visible
    hoverRow            [boolean] true. When true the row get hightlightet when hovered
    noPadding           [boolean] false. When true the vertical padding of all cells are 0px

    notFullWidth        [boolean] false. When true the table is not 100% width and will adjust to it content
    centerInContainer   [boolean] false. When true the table is centered inside its container. Normaally it require notFullWidth: true

    selectable          [boolean] false
    selectedId          [string] "" id for selected row
    onChange            [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected   [boolean] false. If true it is allowed to un-select a selected row
    allowReselect       [Boolean] false. If true the onChange is called when a selected item is reselected/clicked

    defaultColunmOptions: {}. Any of the options for columns to be used as default values

    rowClassName      : [] of string. []. Class-names for each row

    Sorting is done by https://github.com/joequery/Stupid-Table-Plugin


*******************************************************************/
    var defaultOptions = {
            baseClass           : 'table',
            styleClass          : 'fixed',
            showHeader          : true,
            verticalBorder      : true,
            noBorder            : false,
            hoverRow            : true,
            noPadding           : false,
            notFullWidth        : false,
            centerInContainer   : false,
            useTouchSize        : true,
            defaultColunmOptions: {},
            rowClassName        : []

        },

        defaultColunmOptions = {
            align        : 'left',
            verticalAlign: 'middle',
            noWrap       : false,
            truncate     : false,
            fixedWidth   : false,
            sortBy       : 'string',
            sortable     : false
        },

        dataTableId = 'bsTable_options';


    //********************************************************************
    function adjustThOrTd( $element, columnOptions, addWidth ){
        $element
            ._bsAddStyleClasses( columnOptions.textStyle )
            .addClass('align-' + columnOptions.verticalAlign )
            ._bsAddStyleClasses( columnOptions.align )
            .toggleClass('text-nowrap', !!columnOptions.noWrap )
//TODO            .toggleClass('text-truncate', !!columnOptions.truncate )
            .toggleClass('no-horizontal-padding', !!columnOptions.noHorizontalPadding );

        if (addWidth && columnOptions.width)
            $element.css({
                'width'    : columnOptions.width,
                'max-width': columnOptions.width
            });

        return $element;
    }

    /********************************************************************
    Different sort-functions for moment-objects: (a,b) return a-b
    ********************************************************************/
    function momentSort(m1, m2){
        var moment1 = moment(m1),
            moment2 = moment(m2);
        if (moment1.isSame(moment2)) return 0;
        if (moment1.isBefore(moment2)) return -1;
        return 1;
    }

    //momentDateSort - sort by date despide the time
    function momentDateSort(m1, m2){
        return momentSort(
            moment(m1).startOf('day'),
            moment(m2).startOf('day')
        );
    }

    //momentTimeSort - sort by time despide ther date
    function momentTimeSort(m1, m2){
        return momentSort(
            moment(m1).date(1).month(0).year(2000),
            moment(m2).date(1).month(0).year(2000)
        );
    }

    var stupidtableOptions = {
            'moment'     : momentSort,
            'moment_date': momentDateSort,
            'moment_time': momentTimeSort
        };

    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( rowContent ){
            var options = this.data(dataTableId),
                $tbody  = this.find('tbody').first(),
                $tr     = $('<tr/>').appendTo( $tbody );

            if (options.rowClassName.length){
                var rowIndex = $tbody.children('tr').length - 1;
                if (options.rowClassName.length > rowIndex)
                    $tr.addClass(options.rowClassName[rowIndex]);
            }

            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);

            $.each( options.columns, function( index, columnOptions ){
                var content = rowContent[columnOptions.id],
                    $td = $('<td/>').appendTo($tr);

                adjustThOrTd( $td, columnOptions, !options.showHeader );

                if ($.isPlainObject(content) && content.className)
                    $td.addClass(content.className);

                //Build the content using _bsAppendContent or jquery-value-format
                if (columnOptions.vfFormat)
                    $td.vfValueFormat( content, columnOptions.vfFormat, columnOptions.vfOptions );
                else {
                    $td._bsAppendContent( content );
                }
            });

            //Add rows to radioGroup
            if (options.selectable)
                options.radioGroup.addElement( $tr );
        },


        /**********************************************************
        _getColumn - Return the column with id or index
        **********************************************************/
        _getColumn: function( idOrIndex ){
            return $.isNumeric(idOrIndex) ? this.columns[idOrIndex] : this.columnIds[idOrIndex];
        },

        /**********************************************************
        sortBy - Sort the table
        **********************************************************/
        sortBy: function( idOrIndex, dir ){
            var column = this._getColumn(idOrIndex);
            if (column)
                column.$th.stupidsort( dir );
        },

        /**********************************************************
        beforeTableSort - Called before the table is being sorted by StupidTable
        **********************************************************/
        beforeTableSort: function(event, sortInfo){
            var column          = this._getColumn(sortInfo.column),
                sortMulticolumn = column.$th.data('sort-multicolumn') || '',
                _this           = this;

            //Remove all group-header-rows
            this.find('.table-sort-group-header').remove();

            //Convert sortMulticolumn to array
            sortMulticolumn = sortMulticolumn.split(',');
            sortMulticolumn.push(''+column.index);

            $.each( sortMulticolumn, function( dummy, columnIndex ){
                var column = _this._getColumn( parseInt( columnIndex ) );
                //If cell-content is vfFormat-object => Set 'sort-value' from vfFormat
                if (column.vfFormat){
                    _this.find('td:nth-child('+(column.index+1)+')').each( function( dummy, td ){
                        var $td = $(td);
                        $td.data( 'sort-value', $td.data('vf-value') );
                    });
                }
            });
        },

        /**********************************************************
        afterTableSort - Called after the table is being sorted by StupidTable
        **********************************************************/
        afterTableSort: function(event, sortInfo){
            //Update the class-names of the cloned <thead>
            var cloneThList = this.$theadClone.find('th');
            this.find('thead th').each( function( index, th ){
                $(cloneThList[index])
                    .removeClass()
                    .addClass( $(th).attr('class') );
            });

            var column = this._getColumn( sortInfo.column );

            //Marks first row of changed value
            if (column.sortHeader) {

                //$tdBase = a <td> as $-object acting as base for all tds in header-row
                var $tdBase =
                        $('<td/>')
                            .addClass('container-icon-and-text')
                            .attr('colspan', this.columns.length );
                column.$th.contents().clone().appendTo( $tdBase );
                $tdBase.append( $('<span>:</span>') );

                var lastText = "Denne her text kommer sikkert ikke igen";
                this.find('tbody tr td:nth-child(' + (sortInfo.column+1) +')').each( function( index, td ){
                    var $td = $(td),
                        nextText = $td.text();
                    if (nextText != lastText){
                        //Create a clone of $tdBase and 'copy' all children from $td to $newTd
                        var $newTd = $tdBase.clone(true);
                        $td.contents().clone().appendTo( $newTd );

                        //Create new row and insert before current row
                        $('<tr/>')
                            .addClass('table-sort-group-header')
                            .append( $newTd )
                            .insertBefore( $td.parent() );

                        lastText = nextText;
                    }
                });
            }
        },

        /**********************************************************
        asModal - display the table in a modal-window with fixed header and scrolling content
        **********************************************************/
        asModal: function( modalOptions ){
            var showHeader = this.find('.no-header').length == 0,
                _this      = this,
                $tableWithHeader = null,
                $result, $thead, count;

            if (showHeader){
                //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
                //Add on-click on the clone to 'pass' the click to the original header
                this.$theadClone = this.find('thead').clone( true, false );

                this.$theadClone.find('th').on('click', function( event ){
                    var columnIndex = $(event.delegateTarget).index();
                    _this.sortBy( columnIndex );
                });

                $tableWithHeader =
                    $('<table/>')
                        ._bsAddBaseClassAndSize( this.data(dataTableId) )
                        .addClass('table-with-header')
                        .append( this.$theadClone );
                $thead = this.find('thead');
                count  = 20;
            }



            $result = $.bsModal(
                            $.extend( modalOptions || {}, {
                                flexWidth        : true,
                                noVerticalPadding: true,
                                content          : this,
                                fixedContent     : $tableWithHeader
                            })
                          );

            if (showHeader){
                //Using timeout to wait for the browser to update DOM and get height of the header
                var setHeaderHeight = function(){
                        var height = $tableWithHeader.outerHeight();
                        if (height <= 0){
                            count--;
                            if (count){
                                //Using timeout to wait for the browser to update DOM and get height of the header
                                setTimeout( setHeaderHeight, 50 );
                                return;
                            }
                        }

                        _this.css('margin-top', -height+'px');
                        setHeaderWidth();

                        //Only set header-height once
                        $result.off('shown.bs.modal.table', setHeaderHeight );
                    },

                    setHeaderWidth = function(){
                        $thead.find('th').each(function( index, th ){
                            _this.$theadClone.find('th:nth-child(' + (index+1) + ')')
                                .width( $(th).width()+'px' );
                        });
                        $tableWithHeader.width( _this.width()+'px' );
                    };

                $result.on('shown.bs.modal.table', setHeaderHeight );
                $thead.resize( setHeaderWidth );
            }

            return $result;
        }

    }; //end of bsTable_prototype = {

    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId  = 0,
        rowId    = 0;

    $.bsTable = function( options ){

        options = $._bsAdjustOptions( options, defaultOptions );
        options.class =
//Removed because useTouchSize added to options            (options.small ? 'table-sm ' : '' ) +
            (options.verticalBorder && !options.noBorder ? 'table-bordered ' : '' ) +
            (options.noBorder ? 'table-no-border ' : '' ) +
            (options.hoverRow ? 'table-hover ' : '' ) +
            (options.noPadding ? 'table-no-padding ' : '' ) +
            (options.notFullWidth ? 'table-not-full-width ' : '' ) +
            (options.centerInContainer ? 'table-center-in-container ' : '' ) +
            (options.selectable ? 'table-selectable ' : '' ) +
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' );

        //Adjust each column
        var columnIds = {};
        $.each( options.columns, function( index, columnOptions ){
            columnOptions.sortable = columnOptions.sortable || columnOptions.sortBy;
            columnOptions = $.extend( true,
                {
                    index    : index,
                    sortIndex: (index+1)*100
                },
                defaultColunmOptions,
                options.defaultColunmOptions,
                columnOptions
            );

            columnIds[columnOptions.id] = columnOptions;
            options.columns[index] = columnOptions;
        });

        var id = 'bsTable'+ tableId++,
            $table = $('<table/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id': id
                        }),
            $thead = $('<thead/>')
                        .toggleClass('no-header', !options.showHeader )
                        .appendTo( $table ),
            $tr = $('<tr/>')
                    .appendTo( $thead );

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

        $table.columns = options.columns;
        $table.columnIds = columnIds;

        //Create colgroup
        var $colgroup = $('<colgroup/>').appendTo($table);
        $.each( options.columns, function( index, columnOptions ){
            var $col = $('<col/>').appendTo( $colgroup );
            if (columnOptions.fixedWidth)
                $col.attr('width', '1');
        });

        var sortableTable  = false,
            sortDefaultId  = '',
            sortDefaultDir = 'asc',
            multiSortList  = [];

        /* From https://github.com/joequery/Stupid-Table-Plugin:
            "A multicolumn sort allows you to define secondary columns to sort by in the event of a tie with two elements in the sorted column.
                Specify a comma-separated list of th identifiers in a data-sort-multicolumn attribute on a <th> element..."

            multiSortList = []{columnIndex, sortIndex} sorted by sortIndex. Is used be each th to define alternative sort-order
        */
        $.each( options.columns, function( index, columnOptions ){
            if (columnOptions.sortable)
                multiSortList.push( {columnIndex: index, sortIndex: columnOptions.sortIndex });
        });
        multiSortList.sort(function( c1, c2){ return c1.sortIndex - c2.sortIndex; });

        //Create headers
        if (options.showHeader)
            $.each( $table.columns, function( index, columnOptions ){
                columnOptions.$th = $('<th/>').appendTo( $tr );

                if (columnOptions.sortable){
                    columnOptions.$th
                        .addClass('sortable')
                        .attr('data-sort', columnOptions.sortBy);

                    if (columnOptions.sortDefault){
                        sortDefaultId  = columnOptions.id;
                        sortDefaultDir = columnOptions.sortDefault == 'desc' ? 'desc' : sortDefaultDir;
                    }

                    //Create alternative/secondary columns to sort by
                    var sortMulticolumn = '';
                    $.each( multiSortList, function( index, multiSort ){
                        if (multiSort.columnIndex != columnOptions.index)
                            sortMulticolumn = (sortMulticolumn ? sortMulticolumn + ',' : '') + multiSort.columnIndex;
                    });

                    if (sortMulticolumn)
                        columnOptions.$th.attr('data-sort-multicolumn', sortMulticolumn);

                    sortableTable = true;
                }


                adjustThOrTd( columnOptions.$th, columnOptions, true );

                columnOptions.$th._bsAddHtml( columnOptions.header );
            });

        if (options.selectable){
            var radioGroupOptions = $.extend( true, {}, options );
            radioGroupOptions.className = 'active';
            options.radioGroup = $.radioGroup( radioGroupOptions );
        }

        $table.data(dataTableId, options);


        //Create tbody and all rows
        $table.append( $('<tbody/>') );

        $.each( options.content, function( index, rowContent ){
            $table.addRow( rowContent );
        });

        if (sortableTable){
            $table.stupidtable =
                $table.stupidtable( stupidtableOptions )
                    .bind('beforetablesort', $.proxy( $table.beforeTableSort, $table ) )
                    .bind('aftertablesort',  $.proxy( $table.afterTableSort,  $table ) );

            if (sortDefaultId)
                $table.sortBy(sortDefaultId, sortDefaultDir);
        }
        return $table;
    };



}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-tabs.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /******************************************************
    bsTabs
<nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true"><i class="fa fa-home"></i>&nbsp;<span>Home</span></a>
        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</a>
        <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</a>
    </div>
</nav>
<div class="tab-content" id="nav-tabContent">
    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">FIRST Sint sit mollit irure quis est nostrud cillum consequat Lorem esse do quis dolor esse fugiat sunt do. Eu ex commodo veniam Lorem aliquip laborum occaecat qui Lorem esse mollit dolore anim cupidatat. Deserunt officia id Lorem nostrud aute id commodo elit eiusmod enim irure amet eiusmod qui reprehenderit nostrud tempor. Fugiat ipsum excepteur in aliqua non et quis aliquip ad irure in labore cillum elit enim. Consequat aliquip incididunt ipsum et minim laborum laborum laborum et cillum labore. Deserunt adipisicing cillum id nulla minim nostrud labore eiusmod et amet. Laboris consequat consequat commodo non ut non aliquip reprehenderit nulla anim occaecat. Sunt sit ullamco reprehenderit irure ea ullamco Lorem aute nostrud magna.</div>
    <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">SECOND</div>
    <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">THIRD</div>
</div>
    ******************************************************/
    var tabsId = 0;
    $.bsTabs = function( options ){
        var $result = $('<div/>'),
            id = 'bsTabs'+ tabsId++,

            $tabs =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'nav-tabs',
                            styleClass  : '',
                            class       : 'nav' + (options.hideNotSelectedText ? ' hide-not-selected-text' : ''),
                            useTouchSize: true
                        })
                    )
                    .attr({'id': id, 'role': "tablist"})
                    .appendTo( $result ),

            $contents =
                $('<div/>')
                    ._bsAddBaseClassAndSize(
                        $._bsAdjustOptions( options, {}, {
                            baseClass   : 'tab-content',
                            styleClass  : '',
                            class       : '',
                            useTouchSize: false
                        })
                    )
                    .attr({'id': id+'content'})
                    .appendTo( $result );

        if (options.height)
            $contents.height( options.height );


        $.each( options.list, function( index, opt ){
            opt = $._bsAdjustOptions( opt );
            var tabId = options.id || id + 'tab' + index,
                contentId = tabId + 'content',
                //Create the tab
                $tab =
                    $('<a/>')
                        .addClass('nav-item nav-link')
                        .attr({
                            'id'           : tabId,
                            'role'         : 'tab',
                            'data-toggle'  : "tab",
                            'data-user-id' : opt.id || null,
                            'href'         : '#'+contentId,
                            'aria-controls': contentId
                        })
                        ._bsAddHtml( opt.header || opt )
                        .appendTo( $tabs ),
                //Create the content-container = content + footer
                $container =
                    $('<div/>')
                        .addClass('tab-pane fade')
                        .attr({
                            'id'             : contentId,
                            'role'           : 'tabpanel',
                            'aria-labelledby': tabId
                        })
                        .appendTo( $contents ),

                $content =
                    $('<div/>')
                        .addClass('tab-inner-content')
                        .appendTo( $container );

            //Adding footer
            $('<div/>')
                .addClass('tab-footer')
                ._bsAddHtml( opt.footer )
                .appendTo( $container );

            if (opt.selected){
                $tab
                    .attr('aria-selected', true)
                    .addClass('show active');
                $container.addClass('show active');
            }

            $content = options.scroll ? $content.addScrollbar('vertical') : $content;


            //Add content: string, element, function, setup-json-object, or children (=accordion)
            if (opt.content)
                $content._bsAppendContent( opt.content, opt.contentContext );

        });
        $result.asModal = bsTabs_asModal;
        $result._$tabs = $tabs;
        $result._$contents = $contents;

        return $result;
    };

    function bsTabs_asModal( options ){
        var $result =
                $.bsModal(
                    $.extend( {
                        flexWidth          : true,
                        noVerticalPadding  : true,
                        noHorizontalPadding: true,
                        scroll             : false,
                        content            : this._$contents,
                        fixedContent       : this._$tabs,
                    }, options)
               );

        //Save ref to the scrollBar containing the content and update scrollBar when tab are changed
        var $scrollBar = $result.data('bsModalDialog').bsModal.$content.parent();
        this._$tabs.find('a').on('shown.bs.tab', function() {
            $scrollBar.perfectScrollbar('update');
        });

        return $result;
    }


    //Extend $.fn with method to select a tab given by id (string) or index (integer)
    $.fn.bsSelectTab = function( indexOrId ){
        var $tab =
            $.type(indexOrId) == 'number' ?
            this.find('.nav-tabs a.nav-item:nth-of-type('+(indexOrId+1)+')') :
            this.find('.nav-tabs a.nav-item[data-user-id="' + indexOrId + '"]');

        if ($tab && $tab.length)
            $tab.tab('show');
    };

}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next, window /*, document, undefined*/) {
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

    ns.bsIsTouch =  true;

    $.EMPTY_TEXT = '___***EMPTY***___';

    //FONTAWESOME_PREFIX = the classname-prefix used when non is given. Fontawesome 4.X: 'fa', Fontawesome 5: Free: 'fas' Pro: 'far' or 'fal'
    $.FONTAWESOME_PREFIX = $.FONTAWESOME_PREFIX || 'fa';


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

    //$._bsAdjustOptions: Adjust options to allow text/name/title/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        //*********************************************************************
        //adjustContentOptions: Adjust options for the content of elements
        function adjustContentAndContextOptions( options, context ){
            options.icon     = options.icon || options.headerIcon || options.titleIcon;
            options.text     = options.text || options.header || options.title;

            options.iconClass = options.iconClass       || options.iconClassName       ||
                                options.headerIconClass || options.headerIconClassName ||
                                options.titleIconClass  || options.titleIconClassName;

            options.textClass = options.textClass   || options.textClassName   ||
                                options.headerClass || options.headerClassName ||
                                options.titleClass  || options.titleClassName;

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

        options.selected = options.selected || options.checked || options.active || options.open || options.isOpen;
        options.list     = options.list     || options.buttons || options.items || options.children;

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
    $._bsCreateIcon = function( options, $appendTo, title, className/*, insideStack*/ ){
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
            if (allClassNames.search(/(fa.?\s)|(\sfa.?(\s|$))/g) == -1)
                allClassNames = $.FONTAWESOME_PREFIX + ' ' + allClassNames;

            allClassNames = allClassNames + ' ' + (className || '');

            $icon = $._bsCreateElement( 'i', null, title, null, allClassNames );

        }
        $icon.appendTo( $appendTo );
        return $icon;
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

        _bsAddHtml:  function( options, /*checkForContent*/htmlInDiv, ignoreLink ){
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
//Removed since no content is given
//            if (checkForContent && (options.content != null))
//                return this._bsAddHtml( options.content );

            options = options || '';

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
                                $text.i18n( text, 'html' );
                        }

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );

                $text.appendTo( _this );
            });

            //Add value-format content
            $.each( vfValueArray, function( index, vfValue ){
                $._bsCreateElement( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] )
                    .vfValueFormat( vfValue || '', vfFormatArray[index], vfOptionsArray[index] )
                    .appendTo( _this );
            });

            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return false;
        },

        /****************************************************************************************
        _bsAppendContent( options, context )
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
        _bsAppendContent: function( options, context ){

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

            function buildText( options ){
                return $('<div/>')._bsAddHtml( options );
            }

            function buildHidden( options ){
                return $.bsInput( options ).css('display', 'none');
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

            //Function
            if ($.isFunction( options )){
                options.call( context, this );
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
                        case 'text'             :   buildFunc = buildText;              insideFormGroup = true; addBorder = true; noValidation = true; break;
                        case 'fileview'         :   buildFunc = $.bsFileView;           break;
                        case 'hidden'           :   buildFunc = buildHidden;            noValidation = true; break;
//                        case 'xx'               :   buildFunc = $.bsXx;               break;
                    }
                }

                //Set the parent-element where to append to created element(s)
                var $parent = this,
                    insideInputGroup = false;

                if (insideFormGroup){
                    //Create outer form-group
                    insideInputGroup = true;
                    $parent = $divXXGroup('form-group', options).appendTo( $parent );
                    if (noValidation || options.noValidation)
                        $parent.addClass('no-validation');
                }

                if (insideInputGroup || options.prepend || options.before || options.append || options.after){
                    //Create element inside input-group
                    var $inputGroup = $divXXGroup('input-group', options);
                    if (addBorder && !options.noBorder){
                        //Add border and label (if any)
                        $inputGroup.addClass('input-group-border');
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


                return this;
            }

            //Assume it is a $-element or other object that can be appended directly
            this.append( options );
            return this;
        }
    }); //$.fn.extend


}(jQuery, this.i18next, this, document));