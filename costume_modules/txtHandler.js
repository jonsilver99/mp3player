'use strict';

let ilegal = new RegExp(/[|&;$%@"'<>(){}+,]/g);

module.exports = {

    hasNoValue: function (input) {
        return (input == null || input == '') ? true : false;
    },

    ilegalValue: function (input) {
        return (ilegal.test(input)) ? true : false;
    },

    sanitizeValue: function (input, replaceVal) {
        return input.replace(ilegal, replaceVal);
    }
}
// let string = `"'hell[o j]a'"`;
// console.log(ilegal.test(string));
// string = string.replace(ilegal, '');
// console.log(ilegal.test(string));