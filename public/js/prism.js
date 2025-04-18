setInterval(() => {
  var e,
    a = (function (e) {
      var a = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i,
        n = 0,
        t = {},
        r = {
          manual: e.Prism && e.Prism.manual,
          disableWorkerMessageHandler:
            e.Prism && e.Prism.disableWorkerMessageHandler,
          util: {
            encode: function e(a) {
              return a instanceof s
                ? new s(a.type, e(a.content), a.alias)
                : Array.isArray(a)
                ? a.map(e)
                : a
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/\u00a0/g, " ");
            },
            type: function (e) {
              return Object.prototype.toString.call(e).slice(8, -1);
            },
            objId: function (e) {
              return (
                e.__id || Object.defineProperty(e, "__id", { value: ++n }),
                e.__id
              );
            },
            clone: function e(a, n) {
              var t, s;
              switch (((n = n || {}), r.util.type(a))) {
                case "Object":
                  if (n[(s = r.util.objId(a))]) return n[s];
                  for (var i in ((t = {}), (n[s] = t), a))
                    a.hasOwnProperty(i) && (t[i] = e(a[i], n));
                  return t;
                case "Array":
                  if (n[(s = r.util.objId(a))]) return n[s];
                  return (
                    (t = []),
                    (n[s] = t),
                    a.forEach(function (a, r) {
                      t[r] = e(a, n);
                    }),
                    t
                  );
                default:
                  return a;
              }
            },
            getLanguage: function (e) {
              for (; e; ) {
                var n = a.exec(e.className);
                if (n) return n[1].toLowerCase();
                e = e.parentElement;
              }
              return "none";
            },
            setLanguage: function (e, n) {
              (e.className = e.className.replace(RegExp(a, "gi"), "")),
                e.classList.add("language-" + n);
            },
            currentScript: function () {
              if ("undefined" == typeof document) return null;
              if ("currentScript" in document) return document.currentScript;
              try {
                throw Error();
              } catch (e) {
                var a = (/at [^(\r\n]*\((.*):[^:]+:[^:]+\)$/i.exec(e.stack) ||
                  [])[1];
                if (a) {
                  var n = document.getElementsByTagName("script");
                  for (var t in n) if (n[t].src == a) return n[t];
                }
                return null;
              }
            },
            isActive: function (e, a, n) {
              for (var t = "no-" + a; e; ) {
                var r = e.classList;
                if (r.contains(a)) return !0;
                if (r.contains(t)) return !1;
                e = e.parentElement;
              }
              return !!n;
            },
          },
          languages: {
            plain: t,
            plaintext: t,
            text: t,
            txt: t,
            extend: function (e, a) {
              var n = r.util.clone(r.languages[e]);
              for (var t in a) n[t] = a[t];
              return n;
            },
            insertBefore: function (e, a, n, t) {
              var s = (t = t || r.languages)[e],
                i = {};
              for (var l in s)
                if (s.hasOwnProperty(l)) {
                  if (l == a)
                    for (var o in n) n.hasOwnProperty(o) && (i[o] = n[o]);
                  n.hasOwnProperty(l) || (i[l] = s[l]);
                }
              var u = t[e];
              return (
                (t[e] = i),
                r.languages.DFS(r.languages, function (a, n) {
                  n === u && a != e && (this[a] = i);
                }),
                i
              );
            },
            DFS: function e(a, n, t, s) {
              s = s || {};
              var i = r.util.objId;
              for (var l in a)
                if (a.hasOwnProperty(l)) {
                  n.call(a, l, a[l], t || l);
                  var o = a[l],
                    u = r.util.type(o);
                  "Object" !== u || s[i(o)]
                    ? "Array" !== u ||
                      s[i(o)] ||
                      ((s[i(o)] = !0), e(o, n, l, s))
                    : ((s[i(o)] = !0), e(o, n, null, s));
                }
            },
          },
          plugins: {},
          highlightAll: function (e, a) {
            r.highlightAllUnder(document, e, a);
          },
          highlightAllUnder: function (e, a, n) {
            var t = {
              callback: n,
              container: e,
              selector:
                'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
            };
            r.hooks.run("before-highlightall", t),
              (t.elements = Array.prototype.slice.apply(
                t.container.querySelectorAll(t.selector)
              )),
              r.hooks.run("before-all-elements-highlight", t);
            for (var s, i = 0; (s = t.elements[i++]); )
              r.highlightElement(s, !0 === a, t.callback);
          },
          highlightElement: function (a, n, t) {
            var s = r.util.getLanguage(a),
              i = r.languages[s];
            r.util.setLanguage(a, s);
            var l = a.parentElement;
            l && "pre" === l.nodeName.toLowerCase() && r.util.setLanguage(l, s);
            var o = a.textContent,
              u = { element: a, language: s, grammar: i, code: o };
            function g(e) {
              (u.highlightedCode = e),
                r.hooks.run("before-insert", u),
                (u.element.innerHTML = u.highlightedCode),
                r.hooks.run("after-highlight", u),
                r.hooks.run("complete", u),
                t && t.call(u.element);
            }
            if (
              (r.hooks.run("before-sanity-check", u),
              (l = u.element.parentElement) &&
                "pre" === l.nodeName.toLowerCase() &&
                !l.hasAttribute("tabindex") &&
                l.setAttribute("tabindex", "0"),
              !u.code)
            ) {
              r.hooks.run("complete", u), t && t.call(u.element);
              return;
            }
            if ((r.hooks.run("before-highlight", u), !u.grammar)) {
              g(r.util.encode(u.code));
              return;
            }
            if (n && e.Worker) {
              var c = new Worker(r.filename);
              (c.onmessage = function (e) {
                g(e.data);
              }),
                c.postMessage(
                  JSON.stringify({
                    language: u.language,
                    code: u.code,
                    immediateClose: !0,
                  })
                );
            } else g(r.highlight(u.code, u.grammar, u.language));
          },
          highlight: function (e, a, n) {
            var t = { code: e, grammar: a, language: n };
            if ((r.hooks.run("before-tokenize", t), !t.grammar))
              throw Error('The language "' + t.language + '" has no grammar.');
            return (
              (t.tokens = r.tokenize(t.code, t.grammar)),
              r.hooks.run("after-tokenize", t),
              s.stringify(r.util.encode(t.tokens), t.language)
            );
          },
          tokenize: function (e, a) {
            var n = a.rest;
            if (n) {
              for (var t in n) a[t] = n[t];
              delete a.rest;
            }
            var g = new l();
            return (
              o(g, g.head, e),
              (function e(a, n, t, l, g, c) {
                for (var d in t)
                  if (t.hasOwnProperty(d) && t[d]) {
                    var p = t[d];
                    p = Array.isArray(p) ? p : [p];
                    for (var f = 0; f < p.length; ++f) {
                      if (c && c.cause == d + "," + f) return;
                      var h = p[f],
                        m = h.inside,
                        v = !!h.lookbehind,
                        $ = !!h.greedy,
                        F = h.alias;
                      if ($ && !h.pattern.global) {
                        var b = h.pattern.toString().match(/[imsuy]*$/)[0];
                        h.pattern = RegExp(h.pattern.source, b + "g");
                      }
                      for (
                        var y = h.pattern || h, k = l.next, x = 0;
                        k !== n.tail && (!c || !(x >= c.reach));
                        x += k.value.length, k = k.next
                      ) {
                        var w,
                          A = k.value;
                        if (n.length > a.length) return;
                        if (!(A instanceof s)) {
                          var S = 1;
                          if ($) {
                            if (!(w = i(y, x, a, v)) || w.index >= a.length)
                              break;
                            var j = w.index,
                              z = w.index + w[0].length,
                              C = x;
                            for (C += k.value.length; j >= C; )
                              C += (k = k.next).value.length;
                            if (
                              ((C -= k.value.length),
                              (x = C),
                              k.value instanceof s)
                            )
                              continue;
                            for (
                              var P = k;
                              P !== n.tail &&
                              (C < z || "string" == typeof P.value);
                              P = P.next
                            )
                              S++, (C += P.value.length);
                            S--, (A = a.slice(x, C)), (w.index -= x);
                          } else if (!(w = i(y, 0, A, v))) continue;
                          var j = w.index,
                            _ = w[0],
                            E = A.slice(0, j),
                            L = A.slice(j + _.length),
                            T = x + A.length;
                          c && T > c.reach && (c.reach = T);
                          var O = k.prev;
                          E && ((O = o(n, O, E)), (x += E.length)), u(n, O, S);
                          var D = new s(d, m ? r.tokenize(_, m) : _, F, _);
                          if (((k = o(n, O, D)), L && o(n, k, L), S > 1)) {
                            var I = { cause: d + "," + f, reach: T };
                            e(a, n, t, k.prev, x, I),
                              c && I.reach > c.reach && (c.reach = I.reach);
                          }
                        }
                      }
                    }
                  }
              })(e, g, a, g.head, 0),
              (function e(a) {
                for (var n = [], t = a.head.next; t !== a.tail; )
                  n.push(t.value), (t = t.next);
                return n;
              })(g)
            );
          },
          hooks: {
            all: {},
            add: function (e, a) {
              var n = r.hooks.all;
              (n[e] = n[e] || []), n[e].push(a);
            },
            run: function (e, a) {
              var n = r.hooks.all[e];
              if (n && n.length) for (var t, s = 0; (t = n[s++]); ) t(a);
            },
          },
          Token: s,
        };
      function s(e, a, n, t) {
        (this.type = e),
          (this.content = a),
          (this.alias = n),
          (this.length = 0 | (t || "").length);
      }
      function i(e, a, n, t) {
        e.lastIndex = a;
        var r = e.exec(n);
        if (r && t && r[1]) {
          var s = r[1].length;
          (r.index += s), (r[0] = r[0].slice(s));
        }
        return r;
      }
      function l() {
        var e = { value: null, prev: null, next: null },
          a = { value: null, prev: e, next: null };
        (e.next = a), (this.head = e), (this.tail = a), (this.length = 0);
      }
      function o(e, a, n) {
        var t = a.next,
          r = { value: n, prev: a, next: t };
        return (a.next = r), (t.prev = r), e.length++, r;
      }
      function u(e, a, n) {
        for (var t = a.next, r = 0; r < n && t !== e.tail; r++) t = t.next;
        (a.next = t), (t.prev = a), (e.length -= r);
      }
      if (
        ((e.Prism = r),
        (s.stringify = function e(a, n) {
          if ("string" == typeof a) return a;
          if (Array.isArray(a)) {
            var t = "";
            return (
              a.forEach(function (a) {
                t += e(a, n);
              }),
              t
            );
          }
          var s = {
              type: a.type,
              content: e(a.content, n),
              tag: "span",
              classes: ["token", a.type],
              attributes: {},
              language: n,
            },
            i = a.alias;
          i &&
            (Array.isArray(i)
              ? Array.prototype.push.apply(s.classes, i)
              : s.classes.push(i)),
            r.hooks.run("wrap", s);
          var l = "";
          for (var o in s.attributes)
            l +=
              " " +
              o +
              '="' +
              (s.attributes[o] || "").replace(/"/g, "&quot;") +
              '"';
          return (
            "<" +
            s.tag +
            ' class="' +
            s.classes.join(" ") +
            '"' +
            l +
            ">" +
            s.content +
            "</" +
            s.tag +
            ">"
          );
        }),
        !e.document)
      )
        return (
          e.addEventListener &&
            (r.disableWorkerMessageHandler ||
              e.addEventListener(
                "message",
                function (a) {
                  var n = JSON.parse(a.data),
                    t = n.language,
                    s = n.code,
                    i = n.immediateClose;
                  e.postMessage(r.highlight(s, r.languages[t], t)),
                    i && e.close();
                },
                !1
              )),
          r
        );
      var g = r.util.currentScript();
      function c() {
        r.manual || r.highlightAll();
      }
      if (
        (g &&
          ((r.filename = g.src),
          g.hasAttribute("data-manual") && (r.manual = !0)),
        !r.manual)
      ) {
        var d = document.readyState;
        "loading" === d || ("interactive" === d && g && g.defer)
          ? document.addEventListener("DOMContentLoaded", c)
          : window.requestAnimationFrame
          ? window.requestAnimationFrame(c)
          : window.setTimeout(c, 16);
      }
      return r;
    })(window);
  "undefined" != typeof module && module.exports && (module.exports = a),
    "undefined" != typeof global && (global.Prism = a),
    (a.languages.markup = {
      comment: { pattern: /<!--(?:(?!<!--)[\s\S])*?-->/, greedy: !0 },
      prolog: { pattern: /<\?[\s\S]+?\?>/, greedy: !0 },
      doctype: {
        pattern:
          /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
        greedy: !0,
        inside: {
          "internal-subset": {
            pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
            lookbehind: !0,
            greedy: !0,
            inside: null,
          },
          string: { pattern: /"[^"]*"|'[^']*'/, greedy: !0 },
          punctuation: /^<!|>$|[[\]]/,
          "doctype-tag": /^DOCTYPE/i,
          name: /[^\s<>'"]+/,
        },
      },
      cdata: { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, greedy: !0 },
      tag: {
        pattern:
          /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
        greedy: !0,
        inside: {
          tag: {
            pattern: /^<\/?[^\s>\/]+/,
            inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ },
          },
          "special-attr": [],
          "attr-value": {
            pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
            inside: {
              punctuation: [
                { pattern: /^=/, alias: "attr-equals" },
                { pattern: /^(\s*)["']|["']$/, lookbehind: !0 },
              ],
            },
          },
          punctuation: /\/?>/,
          "attr-name": {
            pattern: /[^\s>\/]+/,
            inside: { namespace: /^[^\s>\/:]+:/ },
          },
        },
      },
      entity: [
        { pattern: /&[\da-z]{1,8};/i, alias: "named-entity" },
        /&#x?[\da-f]{1,8};/i,
      ],
    }),
    (a.languages.markup.tag.inside["attr-value"].inside.entity =
      a.languages.markup.entity),
    (a.languages.markup.doctype.inside["internal-subset"].inside =
      a.languages.markup),
    a.hooks.add("wrap", function (e) {
      "entity" === e.type &&
        (e.attributes.title = e.content.replace(/&amp;/, "&"));
    }),
    Object.defineProperty(a.languages.markup.tag, "addInlined", {
      value: function e(n, t) {
        var r = {};
        (r["language-" + t] = {
          pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
          lookbehind: !0,
          inside: a.languages[t],
        }),
          (r.cdata = /^<!\[CDATA\[|\]\]>$/i);
        var s = {
          "included-cdata": { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, inside: r },
        };
        s["language-" + t] = { pattern: /[\s\S]+/, inside: a.languages[t] };
        var i = {};
        (i[n] = {
          pattern: RegExp(
            /(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(
              /__/g,
              function () {
                return n;
              }
            ),
            "i"
          ),
          lookbehind: !0,
          greedy: !0,
          inside: s,
        }),
          a.languages.insertBefore("markup", "cdata", i);
      },
    }),
    Object.defineProperty(a.languages.markup.tag, "addAttribute", {
      value: function (e, n) {
        a.languages.markup.tag.inside["special-attr"].push({
          pattern: RegExp(
            /(^|["'\s])/.source +
              "(?:" +
              e +
              ")" +
              /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
            "i"
          ),
          lookbehind: !0,
          inside: {
            "attr-name": /^[^\s=]+/,
            "attr-value": {
              pattern: /=[\s\S]+/,
              inside: {
                value: {
                  pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
                  lookbehind: !0,
                  alias: [n, "language-" + n],
                  inside: a.languages[n],
                },
                punctuation: [{ pattern: /^=/, alias: "attr-equals" }, /"|'/],
              },
            },
          },
        });
      },
    }),
    (a.languages.html = a.languages.markup),
    (a.languages.mathml = a.languages.markup),
    (a.languages.svg = a.languages.markup),
    (a.languages.xml = a.languages.extend("markup", {})),
    (a.languages.ssml = a.languages.xml),
    (a.languages.atom = a.languages.xml),
    (a.languages.rss = a.languages.xml),
    (function (e) {
      var a =
        /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
      (e.languages.css = {
        comment: /\/\*[\s\S]*?\*\//,
        atrule: {
          pattern: RegExp(
            "@[\\w-](?:" +
              /[^;{\s"']|\s+(?!\s)/.source +
              "|" +
              a.source +
              ")*?" +
              /(?:;|(?=\s*\{))/.source
          ),
          inside: {
            rule: /^@[\w-]+/,
            "selector-function-argument": {
              pattern:
                /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
              lookbehind: !0,
              alias: "selector",
            },
            keyword: {
              pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
              lookbehind: !0,
            },
          },
        },
        url: {
          pattern: RegExp(
            "\\burl\\((?:" +
              a.source +
              "|" +
              /(?:[^\\\r\n()"']|\\[\s\S])*/.source +
              ")\\)",
            "i"
          ),
          greedy: !0,
          inside: {
            function: /^url/i,
            punctuation: /^\(|\)$/,
            string: { pattern: RegExp("^" + a.source + "$"), alias: "url" },
          },
        },
        selector: {
          pattern: RegExp(
            "(^|[{}\\s])[^{}\\s](?:[^{};\"'\\s]|\\s+(?![\\s{])|" +
              a.source +
              ")*(?=\\s*\\{)"
          ),
          lookbehind: !0,
        },
        string: { pattern: a, greedy: !0 },
        property: {
          pattern:
            /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
          lookbehind: !0,
        },
        important: /!important\b/i,
        function: {
          pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
          lookbehind: !0,
        },
        punctuation: /[(){};:,]/,
      }),
        (e.languages.css.atrule.inside.rest = e.languages.css);
      var n = e.languages.markup;
      n &&
        (n.tag.addInlined("style", "css"), n.tag.addAttribute("style", "css"));
    })(a),
    (a.languages.clike = {
      comment: [
        {
          pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
          lookbehind: !0,
          greedy: !0,
        },
        { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 },
      ],
      string: {
        pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
        greedy: !0,
      },
      "class-name": {
        pattern:
          /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
        lookbehind: !0,
        inside: { punctuation: /[.\\]/ },
      },
      keyword:
        /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
      boolean: /\b(?:false|true)\b/,
      function: /\b\w+(?=\()/,
      number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
      operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
      punctuation: /[{}[\];(),.:]/,
    }),
    (a.languages.javascript = a.languages.extend("clike", {
      "class-name": [
        a.languages.clike["class-name"],
        {
          pattern:
            /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
          lookbehind: !0,
        },
      ],
      keyword: [
        { pattern: /((?:^|\})\s*)catch\b/, lookbehind: !0 },
        {
          pattern:
            /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
          lookbehind: !0,
        },
      ],
      function:
        /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
      number: {
        pattern: RegExp(
          /(^|[^\w$])/.source +
            "(?:" +
            (/NaN|Infinity/.source +
              "|" +
              /0[bB][01]+(?:_[01]+)*n?/.source +
              "|" +
              /0[oO][0-7]+(?:_[0-7]+)*n?/.source +
              "|" +
              /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source +
              "|" +
              /\d+(?:_\d+)*n/.source) +
            "|" +
            /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/
              .source +
            ")" +
            /(?![\w$])/.source
        ),
        lookbehind: !0,
      },
      operator:
        /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/,
    })),
    (a.languages.javascript["class-name"][0].pattern =
      /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/),
    a.languages.insertBefore("javascript", "keyword", {
      regex: {
        pattern: RegExp(
          /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source +
            /\//.source +
            "(?:" +
            /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/
              .source +
            "|" +
            /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/
              .source +
            ")" +
            /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/
              .source
        ),
        lookbehind: !0,
        greedy: !0,
        inside: {
          "regex-source": {
            pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
            lookbehind: !0,
            alias: "language-regex",
            inside: a.languages.regex,
          },
          "regex-delimiter": /^\/|\/$/,
          "regex-flags": /^[a-z]+$/,
        },
      },
      "function-variable": {
        pattern:
          /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
        alias: "function",
      },
      parameter: [
        {
          pattern:
            /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
          lookbehind: !0,
          inside: a.languages.javascript,
        },
        {
          pattern:
            /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
          lookbehind: !0,
          inside: a.languages.javascript,
        },
        {
          pattern:
            /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
          lookbehind: !0,
          inside: a.languages.javascript,
        },
        {
          pattern:
            /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
          lookbehind: !0,
          inside: a.languages.javascript,
        },
      ],
      constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
    }),
    a.languages.insertBefore("javascript", "string", {
      hashbang: { pattern: /^#!.*/, greedy: !0, alias: "comment" },
      "template-string": {
        pattern:
          /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
        greedy: !0,
        inside: {
          "template-punctuation": { pattern: /^`|`$/, alias: "string" },
          interpolation: {
            pattern:
              /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
            lookbehind: !0,
            inside: {
              "interpolation-punctuation": {
                pattern: /^\$\{|\}$/,
                alias: "punctuation",
              },
              rest: a.languages.javascript,
            },
          },
          string: /[\s\S]+/,
        },
      },
      "string-property": {
        pattern:
          /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
        lookbehind: !0,
        greedy: !0,
        alias: "property",
      },
    }),
    a.languages.insertBefore("javascript", "operator", {
      "literal-property": {
        pattern:
          /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
        lookbehind: !0,
        alias: "property",
      },
    }),
    a.languages.markup &&
      (a.languages.markup.tag.addInlined("script", "javascript"),
      a.languages.markup.tag.addAttribute(
        /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/
          .source,
        "javascript"
      )),
    (a.languages.js = a.languages.javascript);
});
