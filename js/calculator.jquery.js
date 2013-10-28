(function($, window, document, undefined) {
	var Calculator = {
		init: function(options, element) {
			var self = this;
			self.options = $.extend({}, $.fn.calculator.options, options);
			if(self.options.debug) console.time('init');
			self.data = {
				number: [],
				problem: [],
				solution: null,
				operators: {
					multiply: '*',
					divide: '/',
					add: '+',
					subtract: '-'
				},
				successive_equals: 0,
				successive_operator: 0
			};
			self.bind_buttons();
			if(self.get_memory() > -1) {
				$('#display #info #memory').html('M');
			}
			self.refresh_display(false);
			self.set_dimensions($(element));
			self.set_colors($(element));
			$(element).fadeIn(150);
			if(self.options.debug) console.timeEnd('init');
		},
		set_dimensions: function($elem) {
			var self = this;
			if(self.options.width === 'auto') {
				$elem.css('width', 'auto');
			} else if(typeof(self.options.width) === 'number') {
				$elem.width(self.options.width);
			}
			if(self.options.height === 'auto') {
				$elem.css('height', 'auto');
			} else if(typeof(self.options.height) === 'number') {
				$elem.height(self.options.height);
			}
		},
		set_colors: function($elem) {
			var self = this;

			if(self.options.colors.buttons.hasOwnProperty('from') && self.options.colors.buttons.hasOwnProperty('to')) {
				$elem.css('background-color', self.options.colors.buttons.to);
				$elem.find('#body').css('background-color', self.options.colors.buttons.from);
				$elem.find('.btn').css('background-color', self.options.colors.buttons.from);
				$elem.find('.btn').css('background-image', '-moz-linear-gradient(top, '+self.options.colors.buttons.from+', '+self.options.colors.buttons.to+')');
				$elem.find('.btn').css('background-image', '-webkit-linear-gradient(top, '+self.options.colors.buttons.from+', '+self.options.colors.buttons.to+')');
				$elem.find('.btn').css('background-image', 'linear-gradient('+self.options.colors.buttons.from+', '+self.options.colors.buttons.to+')');
				$elem.find('.btn').css('border-color', self.options.colors.buttons.from);
			} else if(typeof(self.options.colors.buttons) === 'string') {
				$elem.css('background-color', self.options.buttons);
				$elem.find('#body').css('background-color', self.options.buttons);
				$elem.find('.btn').css('background-color', self.options.buttons);
				$elem.find('.btn').css('border-color', self.options.colors.buttons);
			}
			if(self.options.colors.display.hasOwnProperty('from') && self.options.colors.display.hasOwnProperty('to')) {
				$elem.find('#display').css('background-color', self.options.colors.display.from);
				$elem.find('#display').css('background-image', '-moz-linear-gradient(top, '+self.options.colors.display.from+', '+self.options.colors.display.to+')');
				$elem.find('#display').css('background-image', '-webkit-linear-gradient(top, '+self.options.colors.display.from+', '+self.options.colors.display.to+')');
				$elem.find('#display').css('background-image', 'linear-gradient('+self.options.colors.display.from+', '+self.options.colors.display.to+')');
				$elem.find('#display').css('border-color', self.options.colors.display.from);
			} else if(typeof(self.options.colors.display) === 'string') {
				$elem.css('background-color', self.options.colors.display);
				$elem.find('#body').css('background-color', self.options.colors.display);
				$elem.find('.btn').css('background-color', self.options.colors.display);
				$elem.find('.btn').css('border-color', self.options.colors.display);
			}
			if(self.options.hasOwnProperty('font')) {
				var config = {
					google: {families: [encodeURIComponent(self.options.font)]}
				};
				var font = document.createElement('script');
				font.src = ('https:' == document.location.protocol ? 'https' : 'http')+'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
				font.type = 'text/javascript';
				font.async = 'true';
				var script = document.getElementsByTagName('script')[0];
				script.parentNode.insertBefore(font, script);
				$elem.css('font-family', self.options.font);
			}
			$elem.find('#display').css('color', self.options.colors.text);
			$elem.find('.btn').css('color', self.options.colors.text);

		},
		toggle_operators: function(value) {
			var self = this;
			if(value) {
				$('.btn[id^=operator_]').removeClass('disabled');
				$('.btn[id^=operator_'+value+']').addClass('disabled');
				$('#display #info #operator').html(self.data.operators[value]);
			} else {
				$('.btn[id^=operator_]').removeClass('disabled');
			}
		},
		get_memory: function() {
			var search = 'value=',
			value = null;
			if(document.cookie.length > 0) {
				var offset = document.cookie.indexOf(search);
				if(offset !== -1) {
					offset += search.length;
					var end = (document.cookie.indexOf(';', offset) === -1)? document.cookie.length : document.cookie.indexOf(';', offset);
					value = unescape(document.cookie.substring(offset, end));
				}
			}
			return (value === null)? -1 : parseFloat(value);
		},
		set_memory: function(value) {
			document.cookie = 'value='+value;
			$('#display #info #memory').html('M');
		},
		clear_memory: function() {
			document.cookie = 'value=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			$('#display #info #memory').html('');
		},
		refresh_display: function(hide_operator) {
			var self = this;
			var display_value = (self.data.solution === null)? 0 : self.data.solution;
			if(self.data.number.length > 0) {
				display_value = self.get_number();
			}
			if(hide_operator) {
				$('#display #info #operator').html('');
			}
			display_value = isNaN(display_value)? 'E' : display_value;
			$('#display #number').html(display_value);
		},
		get_number: function() {
			var self = this;
			// var length = self.data.number.slice(0, 15).length;
			var length = self.data.number.length;
			if(length > 0) {
				if(length === 1 && self.data.number[0] === '.') {
					return '0.';
				}
				var number_string = '';
				for(var i = 0; i < length; i++) {
					number_string += self.data.number[i];
				}
				return (number_string.length > 15)? self.to_exponent(parseFloat(number_string)) : parseFloat(number_string);
			}
			return null;
		},
		to_precision: function(number) {
			var self = this;
			var accuracy = Math.pow(10, self.options.accuracy);
			return Math.round(number*accuracy)/accuracy;
		},
		to_exponent: function(number) {
			var self = this;
			var exponent = number.toExponential();
			var e = exponent.substring(exponent.indexOf('e'), exponent.length);
			var num = self.to_precision(exponent.replace(e, ''));
			return num+e;
		},
		get_solution: function() {
			var self = this;
			if(self.options.debug) console.time('get_solution');
			var solution = self.to_precision(self.perform_operation());
			self.data.solution = (solution.toString().length > 15)? self.to_exponent(solution) : solution;
			self.data.problem = [];
			if(self.options.debug) console.timeEnd('get_solution');
		},
		perform_operation: function() {
			var self = this,
			first_number = self.data.problem[0]*1,
			second_number = self.data.problem[2]*1;
			switch(self.data.operators[self.data.problem[1]]){
				case self.data.operators.add: return first_number+second_number; break;
				case self.data.operators.subtract: return first_number-second_number; break;
				case self.data.operators.divide: return first_number/second_number; break;
				case self.data.operators.multiply: return first_number*second_number; break;
			}
		},
		get_display: function() {
			return parseFloat($('#display #number').html());
		},
		clear_display: function() {
			var self = this;
			self.toggle_operators(false);
			self.data.problem = [];
			self.data.number = [];
			self.data.solution = null;
			self.refresh_display(false);
		},
		bind_buttons: function() {
			var self = this;
			$(document).on('click', '.btn', function(event) {
				var args = $(this).prop('id').split('_'),
				type = args[0],
				value = args[1];
				if($(this).hasClass('disabled')) {
					return false;
				}
				switch(type) {
					case 'number':
						if(self.data.problem.length === 0) {
							self.data.solution = null;
						}
						if(self.data.successive_equals > 0) {
							self.data.successive_equals = 0;
						}
						self.data.successive_operator = 0;
						self.toggle_operators(false);
						if(self.data.number.length === 0 && value === '0') {
							return false;
						}
						if(self.data.number.length === 1 && self.data.number[0] === '-' && value === '0') {
							self.data.number[0] = '0';
						}
						if(value === '.' && self.data.number.indexOf('.') < 0) {
							self.data.number.push(value);
						} else if(value !== '.') {
							self.data.number.push(value);
						}
						self.refresh_display(false);
					break;
					case 'operator':
						if(self.data.successive_operator > 0) {
							if(value === 'subtract' && self.data.number.length === 0) {
								self.data.number.push('-');
								self.data.successive_operator = 0;
								return false;
							} else {
								self.data.problem[1] = value;
							}
						}
						self.data.successive_operator++;
						self.data.successive_equals = 0;
						self.toggle_operators(value);
						if(self.data.number.length === 0 && value === 'subtract' && self.data.solution === null && self.data.successive_operator === 1) {
							self.data.number.push('-');
							self.data.successive_operator = 0;
							return false;
						}
						if(self.data.problem.length === 0 && self.data.solution !== null) {
							self.data.problem.push(self.data.solution);
						}
						if(self.data.number.length > 0 && self.data.problem.length < 3) {
							self.data.problem.push(self.get_number());
							self.data.number = [];
						}
						if(self.data.problem.length === 1) {
							self.data.problem.push(value);
						}
						if(self.data.problem.length === 3) {
							self.get_solution(self.data.problem);
							self.data.number = [];
							self.data.problem.push(self.data.solution);
							self.data.problem.push(value);
							self.refresh_display(false);
						}
					break;
					case 'function':
						self.data.successive_operator = 0;
						switch(value) {
							case 'c':
								self.data.successive_equals = 0;
								self.clear_display();
							break;
							case 'mc':
								self.data.successive_equals = 0;
								self.clear_memory();
							break;
							case 'ms':
								self.data.successive_equals = 0;
								if(self.get_number() !== null) {
									var val = self.get_number();
								} else if(self.data.solution !== null) {
									var val = self.data.solution;
								} else {
									var val = 0;
								}
								self.set_memory(val);
							break;
							case 'mr':
								self.data.successive_equals = 0;
								self.toggle_operators(false);
								var num = self.get_memory();
								if(num > -1 && self.get_display() !== num) {
									if(self.data.problem.length === 0 && self.data.number.length > 0) {
										self.data.number = [];
									}
									self.data.number.push(num);
									self.refresh_display(false);
								}
							break;
							case 'equals':
								self.data.successive_equals++;
								if(self.data.successive_equals > 1) {
									return false;
								}
								if(self.data.number.length > 0) {
									self.data.problem.push(self.get_number());
								}
								if(self.data.problem.length !== 3) {
									return false;
								}
								self.get_solution(self.data.problem);
								self.data.number = [];
								self.refresh_display(true);
							break;
						}
					break;
				}
			});
		}
	};
	$.fn.calculator = function(options) {
		return this.each(function() {
			var calculator = Object.create(Calculator);
			calculator.init(options, this);
			$.data(this, 'calculator', calculator);
		});
	};
	$.fn.calculator.options = {
		width: 180,
		height: 245,
		colors: {
			buttons: 'gray',
			display: '#ccc'
		},
		text: '#000',
		font: 'sans-serif',
		accuracy: 2,
		debug: false
	};
})(jQuery, window, document);