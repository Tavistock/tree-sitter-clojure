module.exports = grammar({
  name: 'clojure',
  extras: $ => [/[\s,]/, $.comment],
  rules: {
    source_file: $ => repeat($._form),
    comment: $ => /;.*/,
    _form: $ => choice($._non_discard, $.discard),
    _non_discard: $ => choice($._literal, $._reader_macro),
    discard: $ => seq('#_', optional($.discard), $._non_discard),
    _reader_macro: $ => choice(
      $.anonymous_function,
      $.meta_data,
      $.regex,
      $.var_quote,
      $.set,
      $.dispatch,
      $.deref,
      $.quote,
      $.backtick,
      $.unquote,
      $.unquote_splicing,
      $.gensym,
      $.reader_conditional,
      $.reader_conditional_splicing,
      $.host_expression
    ),
    anonymous_function: $ => seq('#(', repeat($._form), ')'),
    meta_data: $ => seq(choice('#^', '^'), choice($.map, $.symbol, $.keyword), $._form),
    regex: $ => seq('#', $.string),
    var_quote: $ => seq('#\'', $.symbol),
    set: $ => seq('#{', repeat($._form), '}'),
    dispatch: $ => seq('#', $.symbol, $._form),
    deref: $ => seq('@', $._form),
    quote: $ => seq('\'', $._form),
    backtick: $ => seq('`', $._form),
    unquote: $ => seq('~', $._form),
    unquote_splicing: $ => seq('~@', $._form),
    gensym: $ => prec(1, seq($._symbol, '#')),
    reader_conditional: $ => seq("#?(", repeat(seq($.keyword, $._form)), ")"),
    reader_conditional_splicing: $ => seq("#?@(", repeat(seq($.keyword, $._form)), ")"),
    host_expression: $ => seq('#+', $._form, $._form),
    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
          /[^xu0-7]/,
          /[0-7]{1,3}/,
          /x[0-9a-fA-F]{2}/,
          /u[0-9a-fA-F]{4}/,
          /u{[0-9a-fA-F]+}/
      )
    )),
    string: $ => seq(
      '"',
      repeat(choice(
        token.immediate(/[^"\\]+/),
        $.escape_sequence
      )),
      '"'
    ),
    _literal: $ => choice(
      $.number,
      $.symbol,
      $.string,
      $.character,
      $.nil,
      $.boolean,
      $.keyword,
      $.list,
      $.vector,
      $.map
    ),
    _symbol: $ => /((([-+][a-zA-Z.<>$%&=*/+\-!?_'])|([a-zA-Z.<>$%&=*/!?_']))[\w.<>$%&=*/+\-!?_':]*)/,
    symbol: $ => $._symbol,
    keyword: $ => seq(choice(":", "::"), $._symbol),
    nil: $ => "nil",
    boolean: $ => choice("true", "false"),
    character: $ => choice($._named, $._unicode, $._octal, $._any),
    _unicode: $ => /\\u[0-9D-Fd-f][0-9a-fA-F]{3}/,
    _octal: $ => /\\o[0-3][0-7]{2}/,
    _any: $ => /\\./,
    _named: $ => /\\(newline|return|space|tab|formfeed|backspace)/,
    number: $ => choice($._int, $._ratio, $._float),
    _int: $ => seq(optional(/[+-]/),
                   choice("0", /([1-9][0-9]*)/,
                          /0[xX]([0-9A-Fa-f]+)/,
                          /0([0-7]+)/,
                          /([1-9][0-9]?)[rR]([0-9A-Za-z]+)/,
                          /0[0-9]+/),
                   optional("N")),
    _ratio: $ => /([-+]?[0-9]+)\/([0-9]+)/,
    _float: $ => /([-+]?[0-9]+(\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?/,
    list: $ => seq('(', repeat($._form), ')'),
    vector: $ => seq('[', repeat($._form), ']'),
    map: $ => seq(
      optional(choice("#::", seq("#:", $._symbol))), '{', repeat($._form), '}'
    )
  }
});

