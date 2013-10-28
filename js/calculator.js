'use strict';
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
				successive_equals: 0,
				operators: {
					multiply: '*',
					divide: '/',
					add: '+',
					subtract: '-'
				}
			};
			self.bind_buttons();
			self.refresh_display(false);
			if(self.options.debug) console.timeEnd('init');
		},
		toggle_operators: function(value) {
			var self = this;
			if(value) {
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
		},
		clear_memory: function() {
			document.cookie = 'value=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
			var length = self.data.number.slice(0, 15).length;
			if(length > 0) {
				var number_string = '';
				for(var i = 0; i < length; i++) {
					number_string += self.data.number[i];
				}
				return parseFloat(number_string);
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
			if(self.options.debug) console.log('get_solution problem', self.data.problem);
			var solution = self.to_precision(self.perform_operation());
			if(self.options.debug) console.log('solution', solution);
			self.data.solution = (solution.toString().length > 15)? self.to_exponent(solution) : solution;
			if(self.options.debug) console.timeEnd('get_solution');
		},
		perform_operation: function() {
			var self = this;
			if(self.data.problem.length === 1) {
				return self.data.problem[0];
			}
			var remove_after = false,
			result,
			first_number = (typeof(self.data.problem[0]) === 'number' && typeof(self.data.problem[1]) === 'string')? self.data.problem[0]*1 : self.data.problem[1]*1,
			second_number;
			if(self.options.debug) console.log('first_number', first_number);
			var operator = (typeof(self.data.problem[1]) === 'number' && typeof(self.data.problem[0]) === 'string')? self.data.problem[0] : self.data.problem[1];
			if(self.options.debug) console.log('operator', operator);
			// if problem is only a number and an operator OR problem is complete and solution exists perform operation on itself
			if(self.data.problem.length === 2) {
				remove_after = true;
				if(self.data.solution !== null) {
					second_number = self.data.solution;
					if(self.options.debug) console.log('second_number is solution', second_number);
				} else {
					second_number = first_number;
					if(self.options.debug) console.log('second_number is first_number', second_number);
				}
			} else if(self.data.problem.length === 3) {
				second_number = self.data.problem[2]*1;
				if(self.options.debug) console.log('second_number is problem[2]', second_number);
			}
			switch(self.data.operators[operator]){
				case self.data.operators.add: result = first_number+second_number; break;
				case self.data.operators.subtract: result = first_number-second_number; break;
				case self.data.operators.divide: result = first_number/second_number; break;
				case self.data.operators.multiply: result = first_number*second_number; break;
			}
			if(remove_after) {
				if(self.options.debug) console.log('perform_operation removing after');
				self.data.problem = [self.data.problem[0], self.data.problem[1]];
				if(self.options.debug) console.log('resetting problem', self.data.problem);
			}
			if(self.options.debug) console.log('perform_operation returning '+first_number+' '+self.data.operators[operator]+' '+second_number, result);
			return result;
		},
		get_operator: function() {
			var self = this,
			length = self.data.problem.length;
			for(var i = 0; i < length; i++) {
				if(typeof(self.data.problem[i]) === 'string') {
					return self.data.problem[i];
				}
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
						self.data.successive_equals = 0;
						self.toggle_operators(false);
						if(self.data.problem.length === 0) {
							if(self.options.debug) console.log('self.data.problem.length === 0 so we\'re resetting solution to null');
							self.data.solution = null;
						}
						// don't push 0 to an empty number
						if(self.data.number.length === 0 && value === '0') {
							if(self.options.debug) console.log('Number press returning false');
							return false;
						}
						self.data.number.push(value);
						self.refresh_display(false);
						if(self.options.debug) console.log('Number press. number[]', self.data.number);
					break;
					case 'operator':
						self.data.successive_equals = 0;
						self.toggle_operators(value);

						// if we start with a subtract make the number negative						
						if(self.data.number.length === 0 && value === 'subtract' && self.data.solution === null) {
							self.data.number.push('-');
							if(self.options.debug) console.log('returning false because we pushed a sign into a number');
							return false;
						}

						// if the problem has been solved push the current solution to the problem
						if(self.data.problem.length === 0 && self.data.solution !== null) {
							if(self.options.debug) console.log('self.data.problem.length === 0 && self.data.solution !== null');
							self.data.problem.push(self.data.solution);
						}
						
						// if number and operator are set and a solution exists empty the problem and push the solution and the operator pressed
						if(self.data.problem.length === 2 && self.data.solution !== null) {
							if(self.options.debug) console.log('self.data.problem.length === 2 && self.data.solution !== null');
							self.data.problem = [];
							self.data.problem.push(self.data.solution);
							self.data.problem.push(value);
						}
						
						// if there's a number to push to the problem do it
						if(self.data.number.length > 0 && self.data.problem.length < 3) {
							if(self.options.debug) console.log('if there\'s a number to push to the problem do it');
							self.data.problem.push(self.get_number());
							self.data.number = [];
						}

						// if the problem is empty and has not been solved
						if(self.data.problem.length === 0 && self.data.solution === null && (value === 'add' || value === 'subtract')) {
							self.data.problem.push(value);
						}

						// if the problem only contains an operator
						if(self.data.problem.length === 1 && typeof(self.data.problem[0]) !== 'string') {
							self.data.problem.push(value);
						}
						
						// if problem is complete set solution and clear number and problem
						if(self.data.problem.length === 3) {
							self.get_solution();
							self.data.number = [];
							self.data.problem = [];
							if(self.options.debug) console.log('Emptying number and problem');
							self.data.problem.push(self.data.solution);
							if(self.options.debug) console.log('problem: ', self.data.problem);
							self.data.problem.push(value);
							if(self.options.debug) console.log('problem: ', self.data.problem);
							self.refresh_display(false);
						}

						if(self.options.debug) console.log('Operator press. problem[]', self.data.problem);
					break;
					case 'function':
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
								var val = (self.get_number() !== null)? self.get_number() : self.data.solution;
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
									if(self.options.debug) console.log('MR pushing number: ', self.data.number);
									self.refresh_display(false);
								}
							break;
							case 'equals':
								self.data.successive_equals++;
								if(self.options.debug) console.log('self.data.successive_equals', self.data.successive_equals);
								if(self.data.number.length > 0) {
									self.data.problem.push(self.get_number());
								}
								self.get_solution();
								if(self.data.problem.length === 3) {
									var number = self.data.problem[2];
									if(self.data.successive_equals > 1) {
										number = self.data.solution;
									}
									if(self.options.debug) console.log('self.data.successive_equals > 1');
									var operator = self.get_operator();
									if(self.options.debug) console.log('emptying problem b/c it === 3');
									self.data.problem = [];
									if(self.options.debug) console.log('Emptying number and problem');
									self.data.problem.push(number);
									self.data.problem.push(operator);
									if(self.options.debug) console.log('problem: ', self.data.problem);
								}
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
		accuracy: 2,
		debug: false
	};
})(jQuery, window, document);