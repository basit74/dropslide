;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "dropdown"
	,	defaults = {
			
		}
	;

	// create constructor.
	function dropdown( element, options ) {

		// Parent/Container element of dropdown list
		this.hostElement = $( element );
		this.settings = $.extend( {}, defaults, options ); 
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	$.extend( dropdown.prototype, {
		init: function() {

			// Detach the menu
			this.detachedMenu = this.hostElement.find("ul:first").detach();

			// Initilize the navigation history
			this.history = [];

			// Create an empty UL element which will contain the active tree
			this.ul = $('<ul class="' + this.detachedMenu.attr("class") + '"></ul>');
			
			// Append newly created UL in hosting elemenet.
			this.hostElement.append( this.ul );

			// Initially hide back link.
			this.backlink = this.hostElement
								.find(".back-link")
								.hide()
								.off("click")
								.on("click", $.proxy( this.stepback, this ));

			// Insert lis
			this.ul.html( this.getBranches( " > li" ) );
		},

		getBranches: function( pattern ) {
			var listItems = this.detachedMenu.find( pattern );

			listItems.each(  $.proxy( function ( index, element ) {
				this.registerListItemClick( element );
			}, this ) );

			return listItems;
		},

		registerListItemClick: function( element ) {
			var listItem = $( element )
			, 	children = listItem.find("ul")
			;

			if( children.length ) {
				children.hide();

				// register click event on `listItem`
				listItem.off("click").on( "click", $.proxy( this.showList, this ) ).addClass("branch") ;
			} else {
				listItem.addClass("leaf");
			} 
		},
	
		showList: function( event ) {
			
			// access targeted/clicked `li` 
			var target = $( event.target ).closest( "li" );
		
			var isBranch = target.hasClass("branch");

			if( isBranch ) {
				event.preventDefault();
			}
			

			// push currently displayed UL in history array.	
			this.history.push( this.ul.html() );

			this.ul
				.html( target.find("> ul > li") ) // replace menu content( html ) with targeted li's child UL
				.find("li") // find newly pasted li's & register click event
				.hide() 
				.each( $.proxy( function( idx, element ) {
					this.registerListItemClick( element );
				}, this ))
				.fadeIn("slow"); // fadeIn this.ul

			// toggle back link
			this.toggleBackLink();
		},

		toggleBackLink: function() {
			if( this.history.length ) {
				this.backlink.fadeIn( 50 );
			} else {
				this.backlink.fadeOut( 50 );
			}
		},

		stepback: function() {

			this.ul.fadeOut( 200, $.proxy( function() {
				var _self = this
				,	content = this.history.pop()
				;
				
				this.toggleBackLink();

				this.ul.html( content ).fadeIn(100, function() {
						_self.ul.find(" > li").each( function( index, element ) {
						_self.registerListItemClick( element );
					});
				});
			}, this ));
		}
	});

	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new dropdown( this, options ) );
			}
		} );
	};

})(jQuery, window, document);