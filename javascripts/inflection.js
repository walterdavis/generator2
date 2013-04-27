/*
Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
This code is based in part on the work done in Ruby to support
infection as part of Ruby on Rails in the ActiveSupport's Inflector
and Inflections classes.  It was initally ported to Javascript by
Ryan Schuft (ryan.schuft@gmail.com) in 2007.

The code is available at http://code.google.com/p/inflection-js/

The basic usage is:
1. Include this script on your web page.
2. Call functions on any String object in Javascript

Currently implemented functions:

String.pluralize(plural) == String
renders a singular English language noun into its plural form
normal results can be overridden by passing in an alternative

String.singularize(singular) == String
renders a plural English language noun into its singular form
normal results can be overridden by passing in an alterative

String.rcamelize(lowFirstLetter) == String
renders a lower case underscored word into camel case
the first letter of the result will be upper case unless you pass true
also translates "/" into "::" (underscore does the opposite)

String.humanize(lowFirstLetter) == String
renders a lower case and underscored word into human readable form
defaults to making the first letter capitalized unless you pass true

String.rdasherize() == String
renders all underbars and spaces as dashes

String.titleize() == String
renders words into title casing (as for book titles)

String.demodulize() == String
renders class names that are prepended by modules into just the class

String.tableize() == String
renders camel cased singular words into their underscored plural form

String.classify() == String
renders an underscored plural word into its camel cased singular form

String.foreign_key(dropIdUbar) == String
renders a class name (camel cased singular noun) into a foreign key
defaults to seperating the class from the id with an underbar unless
you pass true

String.ordinalize() == String
renders all numbers found in the string into their sequence like "22nd"
*/

/*
This sets up a container for some constants in its own namespace
We use the window (if available) to enable dynamic loading of this script
Window won't necessarily exist for non-browsers.
*/
if (window && !window.InflectionJS)
{
  window.InflectionJS = null;
}

/*
This sets up some constants for later use
This should use the window namespace variable if available
*/
InflectionJS =
{
  /*
  This is a list of nouns that use the same form for both singular and plural.
  This list should remain entirely in lower case to correctly match Strings.
  */
  uncountable_words: [
  'equipment', 'information', 'rice', 'money', 'species', 'series',
  'fish', 'sheep', 'moose', 'deer', 'news'
  ],

  /*
  These rules translate from the singular form of a noun to its plural form.
  */
  plural_rules: [
  [new RegExp('(m)an$', 'gi'),                 '$1en'],
  [new RegExp('(pe)rson$', 'gi'),              '$1ople'],
  [new RegExp('(child)$', 'gi'),               '$1ren'],
  [new RegExp('^(ox)$', 'gi'),                 '$1en'],
  [new RegExp('(ax|test)is$', 'gi'),           '$1es'],
  [new RegExp('(octop|vir)us$', 'gi'),         '$1i'],
  [new RegExp('(alias|status)$', 'gi'),        '$1es'],
  [new RegExp('(bu)s$', 'gi'),                 '$1ses'],
  [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
  [new RegExp('([ti])um$', 'gi'),              '$1a'],
  [new RegExp('sis$', 'gi'),                   'ses'],
  [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'),  '$1$2ves'],
  [new RegExp('(hive)$', 'gi'),                '$1s'],
  [new RegExp('([^aeiouy]|qu)y$', 'gi'),       '$1ies'],
  [new RegExp('(x|ch|ss|sh)$', 'gi'),          '$1es'],
  [new RegExp('(matr|vert|ind)ix|ex$', 'gi'),  '$1ices'],
  [new RegExp('([m|l])ouse$', 'gi'),           '$1ice'],
  [new RegExp('(quiz)$', 'gi'),                '$1zes'],
  [new RegExp('s$', 'gi'),                     's'],
  [new RegExp('$', 'gi'),                      's']
  ],

  /*
  These rules translate from the plural form of a noun to its singular form.
  */
  singular_rules: [
  [new RegExp('(m)en$', 'gi'),                                                       '$1an'],
  [new RegExp('(pe)ople$', 'gi'),                                                    '$1rson'],
  [new RegExp('(child)ren$', 'gi'),                                                  '$1'],
  [new RegExp('([ti])a$', 'gi'),                                                     '$1um'],
  [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi'), '$1$2sis'],
  [new RegExp('(hive)s$', 'gi'),                                                     '$1'],
  [new RegExp('(tive)s$', 'gi'),                                                     '$1'],
  [new RegExp('(curve)s$', 'gi'),                                                    '$1'],
  [new RegExp('([lr])ves$', 'gi'),                                                   '$1f'],
  [new RegExp('([^fo])ves$', 'gi'),                                                  '$1fe'],
  [new RegExp('([^aeiouy]|qu)ies$', 'gi'),                                           '$1y'],
  [new RegExp('(s)eries$', 'gi'),                                                    '$1eries'],
  [new RegExp('(m)ovies$', 'gi'),                                                    '$1ovie'],
  [new RegExp('(x|ch|ss|sh)es$', 'gi'),                                              '$1'],
  [new RegExp('([m|l])ice$', 'gi'),                                                  '$1ouse'],
  [new RegExp('(bus)es$', 'gi'),                                                     '$1'],
  [new RegExp('(o)es$', 'gi'),                                                       '$1'],
  [new RegExp('(shoe)s$', 'gi'),                                                     '$1'],
  [new RegExp('(cris|ax|test)es$', 'gi'),                                            '$1is'],
  [new RegExp('(octop|vir)i$', 'gi'),                                                '$1us'],
  [new RegExp('(alias|status)es$', 'gi'),                                            '$1'],
  [new RegExp('^(ox)en', 'gi'),                                                      '$1'],
  [new RegExp('(vert|ind)ices$', 'gi'),                                              '$1ex'],
  [new RegExp('(matr)ices$', 'gi'),                                                  '$1ix'],
  [new RegExp('(quiz)zes$', 'gi'),                                                   '$1'],
  [new RegExp('s$', 'gi'),                                                           '']
  ],

  /*
  This is a list of words that should not be capitalized for title case
  */
  non_titlecased_words: [
  'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at',
  'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over',
  'with', 'for'
  ],

  /*
  These are regular expressions used for converting between String formats
  */
  id_suffix: new RegExp('(_ids|_id)$', 'g'),
  underbar: new RegExp('_', 'g'),
  space_or_underbar: new RegExp('[\ _]', 'g'),
  uppercase: new RegExp('([A-Z])', 'g'),
  underbar_prefix: new RegExp('^_'),

  /*
  This is a helper method that applies rules based replacement to a String
  Signature:
  InflectionJS.apply_rules(str, rules, skip, override) == String
  Arguments:
  str - String - String to modify and return based on the passed rules
  rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
  skip - Array: [String] - Strings to skip if they match
  override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
  Returns:
  String - passed String modified by passed rules
  Examples:
  InflectionJS.apply_rules("cows", InflectionJs.singular_rules) === 'cow'
  */
  apply_rules: function(str, rules, skip, override)
  {
    if (override)
    {
      str = override;
    }
    else
    {
      var ignore = (skip.myIndexOf(str.toLowerCase()) > -1);
      if (!ignore)
      {
        for (var x = 0; x < rules.length; x++)
        {
          if (str.match(rules[x][0]))
          {
            str = str.replace(rules[x][0], rules[x][1]);
            break;
          }
        }
      }
    }
    return str.toString();
  }
};

/*
This lets us detect if an Array contains a given element
Signature:
Array.myIndexOf(item, fromIndex, compareFunc) == Integer
Arguments:
item - Object - object to locate in the Array
fromIndex - Integer (optional) - starts checking from this position in the Array
compareFunc - Function (optional) - function used to compare Array item vs passed item
Returns:
Integer - index position in the Array of the passed item
Examples:
['hi','there'].myIndexOf("guys") === -1
['hi','there'].myIndexOf("hi") === 0
*/
Object.extend(Array.prototype, (function(){
  function myIndexOf(item, fromIndex, compareFunc){
    if (!fromIndex)
    {
      fromIndex = -1;
    }
    var index = -1;
    for (var i = fromIndex; i < this.length; i++)
    {
      if (this[i] === item || compareFunc && compareFunc(this[i], item))
      {
        index = i;
        break;
      }
    }
    return index;
  }
  return { myIndexOf: myIndexOf };
})());
Object.extend(String.prototype, (function(){
  /*
  This function adds plurilization support to every String object
  Signature:
  String.pluralize(plural) == String
  Arguments:
  plural - String (optional) - overrides normal output with said String
  Returns:
  String - singular English language nouns are returned in plural form
  Examples:
  "person".pluralize() == "people"
  "octopus".pluralize() == "octopi"
  "Hat".pluralize() == "Hats"
  "person".pluralize("guys") == "guys"
  */
  function pluralize(plural)
  {
    return InflectionJS.apply_rules(
      this,
      InflectionJS.plural_rules,
      InflectionJS.uncountable_words,
      plural
    );
  };

  /*
  This function adds singularization support to every String object
  Signature:
  String.singularize(singular) == String
  Arguments:
  singular - String (optional) - overrides normal output with said String
  Returns:
  String - plural English language nouns are returned in singular form
  Examples:
  "people".singularize() == "person"
  "octopi".singularize() == "octopus"
  "Hats".singularize() == "Hat"
  "guys".singularize("person") == "person"
  */
  function singularize(singular)
  {
    return InflectionJS.apply_rules(
      this,
      InflectionJS.singular_rules,
      InflectionJS.uncountable_words,
      singular
    );
  };

  /*
  This function adds camelization support to every String object
  Signature:
  String.rcamelize(lowFirstLetter) == String
  Arguments:
  lowFirstLetter - boolean (optional) - default is to capitalize the first
  letter of the results... passing true will lowercase it
  Returns:
  String - lower case underscored words will be returned in camel case
  additionally '/' is translated to '::'
  Examples:
  "message_properties".rcamelize() == "MessageProperties"
  "message_properties".rcamelize(true) == "messageProperties"
  */
  function rcamelize(lowFirstLetter)
  {
    var str = this.toString().toLowerCase();
    var str_path = str.split('/');
    for (var i = 0; i < str_path.length; i++)
    {
      var str_arr = str_path[i].split('_');
      var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
      for (var x = initX; x < str_arr.length; x++)
      {
        str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
      }
      str_path[i] = str_arr.join('');
    }
    str = str_path.join('::');
    return str;
  };

  /*
  This function adds humanize support to every String object
  Signature:
  String.humanize(lowFirstLetter) == String
  Arguments:
  lowFirstLetter - boolean (optional) - default is to capitalize the first
  letter of the results... passing true will lowercase it
  Returns:
  String - lower case underscored words will be returned in humanized form
  Examples:
  "message_properties".humanize() == "Message properties"
  "message_properties".humanize(true) == "message properties"
  */
  function humanize(lowFirstLetter)
  {
    var str = this.toString().toLowerCase();
    str = str.replace(InflectionJS.id_suffix, '');
    str = str.replace(InflectionJS.underbar, ' ');
    if (!lowFirstLetter)
    {
      str = str.capitalize();
    }
    return str;
  };


  /*
  This function adds dasherization support to every String object
  Signature:
  String.rdasherize() == String
  Arguments:
  N/A
  Returns:
  String - replaces all spaces or underbars with dashes
  Examples:
  "message_properties".capitalize() == "message-properties"
  "Message Properties".capitalize() == "Message-Properties"
  */
  function rdasherize()
  {
    var str = this.toString();
    str = str.replace(InflectionJS.space_or_underbar, '-');
    return str;
  };

  /*
  This function adds titleize support to every String object
  Signature:
  String.titleize() == String
  Arguments:
  N/A
  Returns:
  String - capitalizes words as you would for a book title
  Examples:
  "message_properties".titleize() == "Message Properties"
  "message properties to keep".titleize() == "Message Properties to Keep"
  */
  function titleize()
  {
    var str = this.toString().toLowerCase();
    str = str.replace(InflectionJS.underbar, ' ');
    var str_arr = str.split(' ');
    for (var x = 0; x < str_arr.length; x++)
    {
      var d = str_arr[x].split('-');
      for (var i = 0; i < d.length; i++)
      {
        if (InflectionJS.non_titlecased_words.myIndexOf(d[i].toLowerCase()) < 0)
        {
          d[i] = d[i].capitalize();
        }
      }
      str_arr[x] = d.join('-');
    }
    str = str_arr.join(' ');
    str = str.substring(0, 1).toUpperCase() + str.substring(1);
    return str;
  };


  /*
  This function adds demodulize support to every String object
  Signature:
  String.demodulize() == String
  Arguments:
  N/A
  Returns:
  String - removes module names leaving only class names (Ruby style)
  Examples:
  "Message::Bus::Properties".demodulize() == "Properties"
  */
  function demodulize()
  {
    var str = this.toString();
    var str_arr = str.split('::');
    str = str_arr[str_arr.length - 1];
    return str;
  };

  /*
  This function adds tableize support to every String object
  Signature:
  String.tableize() == String
  Arguments:
  N/A
  Returns:
  String - renders camel cased words into their underscored plural form
  Examples:
  "MessageBusProperty".tableize() == "message_bus_properties"
  */
  function tableize()
  {
    var str = this.toString();
    str = str.underscore().pluralize();
    return str;
  };
  /*
  This function adds classification support to every String object
  Signature:
  String.classify() == String
  Arguments:
  N/A
  Returns:
  String - underscored plural nouns become the camel cased singular form
  Examples:
  "message_bus_properties".classify() == "MessageBusProperty"
  */
  function classify(){
    var str = this.toString();
    str = str.rcamelize().singularize();
    return str;
  };

  /*
  This function adds foreign key support to every String object
  Signature:
  String.foreign_key(dropIdUbar) == String
  Arguments:
  dropIdUbar - boolean (optional) - default is to seperate id with an
  underbar at the end of the class name, you can pass true to skip it
  Returns:
  String - camel cased singular class names become underscored with id
  Examples:
  "MessageBusProperty".foreign_key() == "message_bus_property_id"
  "MessageBusProperty".foreign_key(true) == "message_bus_propertyid"
  */
  function foreign_key(dropIdUbar)
  {
    var str = this.toString();
    str = str.demodulize().underscore() + ((dropIdUbar) ? ('') : ('_')) + 'id';
    return str;
  };

  /*
  This function adds ordinalize support to every String object
  Signature:
  String.ordinalize() == String
  Arguments:
  N/A
  Returns:
  String - renders all found numbers their sequence like "22nd"
  Examples:
  "the 1 pitch".ordinalize() == "the 1st pitch"
  */
  function ordinalize()
  {
    var str = this.toString();
    var str_arr = str.split(' ');
    for (var x = 0; x < str_arr.length; x++)
    {
      var i = parseInt(str_arr[x]);
      if (i === NaN)
      {
        var ltd = str_arr[x].substring(str_arr[x].length - 2);
        var ld = str_arr[x].substring(str_arr[x].length - 1);
        var suf = "th";
        if (ltd != "11" && ltd != "12" && ltd != "13")
        {
          if (ld === "1")
          {
            suf = "st";
          }
          else if (ld === "2")
          {
            suf = "nd";
          }
          else if (ld === "3")
          {
            suf = "rd";
          }
        }
        str_arr[x] += suf;
      }
    }
    str = str_arr.join(' ');
    return str;
  };
  return{
    pluralize: pluralize,
    singularize: singularize,
    rcamelize: rcamelize,
    humanize: humanize,
    rdasherize: rdasherize,
    titleize: titleize,
    demodulize: demodulize,
    tableize: tableize,
    classify: classify,
    foreign_key: foreign_key,
    ordinalize: ordinalize
  };
})());
