// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/mode/overlay';

CodeMirror.defineMode('brillink', function(config, modeConfig) {
  function startState() {
    return {
      commentDepth: 0,
      markupMode: null,
      identationLevel: 0,
      lineStart: null,
      lineMode: null,
      immediately: null,
    };
  }
    
  function token(stream, state) {
    if (state.commentDepth > 0) {
      if (stream.match('-}')) {
        state.commentDepth -= 1;
      } else if (stream.match('{-')) {
        state.commentDepth += 1;
      } else {
        stream.next();
      }
      return 'markup-comment';
    }

    if (stream.match(/ *{-/)) {
      state.commentDepth = 1;
      return 'markup-comment';
    }
  
    if (stream.sol()) {
      const indentation = stream.indentation();
      stream.eatWhile(' ');
      console.log(stream.peek());
      if (stream.eat('#')) {
        if (stream.match(/## */)) {
          if (stream.eol()) {
            // Might be indented |> things
          } else if (stream.peek() === '|') {
            state.immediately = 'getProps';
          } else {
            state.immediately = 'getStitchName';
          }
          return 'header';
        } else {
          while (!stream.eol()) {
            if (stream.match('|>')) {
              stream.backUp(2);
              state.immediately = 'getProps';
              return 'header';
            } else {
              stream.next();
            }
          }
          // Do next-line-possibly-indented by |> type things
          return 'header';
        }
      } else if (stream.eat(/[!?]/)) {
        console.log('STREAM ET')
        const x = stream.match(/ *[a-z][a-zA-Z0-9_]* */);
        console.log(x);
        if (x) {
          console.log('YEAH');
          state.immediately = 'getProps';
          return 'markup-tag';
        } else {
          return 'error';
        }
      } else {
        console.log(`NOT ${stream.peek()}`)
      }

    } else if (state.immediately !== null) {
      const mode = state.immediately;
      state.immediately = null;
      console.log(mode);
      switch (mode) {
        case 'getStitchName':
          if (stream.match(/[a-z][a-zA-Z0-9_-]* */)) {
            state.immediately = stream.eol() ? null : 'getProps';
            return 'sectiontag';
          } else {
            stream.next();
            return 'error';
          }
        case 'getProps':
          if (stream.match(/\|> *[a-z][a-zA-Z0-9_]* */)) {
            state.immediately = stream.eol() ? null : 'getProps';
            return 'markup-label';
          } else if (stream.match(/[0-9]+ */)) {
            state.immediately = stream.eol() ? null : 'getProps';
            return 'literal-arg';
          } else if (stream.match(/[a-z][a-zA-Z0-9_-]* */)) {
            state.immediately = stream.eol() ? null : 'getProps';
            return 'variable-arg';
          } else if (stream.match(/"[a-zA-Z0-9()/\\ _,.!?'-]*" */)) {
            state.immediately = stream.eol() ? null : 'getProps';
            return 'literal-string';
          } else if (stream.match(/-> */)) {
            state.immediately = stream.eol() ? null : 'arrowed';
            return 'arrow';
          } else if (!stream.eol()) {
            stream.next();
            return 'error';
          } else {
            stream.next();
            return null;
          }
        case 'arrowed':
          if (stream.match(/[a-z][a-zA-Z0-9_-]* */)) {
            return 'sectiontag';
          } else {
            stream.next();
            return 'error';
          }
      }
    }

    (stream.next());
    return null;
  }

  return { startState, token };
});
