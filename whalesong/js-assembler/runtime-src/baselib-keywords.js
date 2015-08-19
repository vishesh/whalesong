/*jslint devel: false, browser: true, unparam: true, vars: true, plusplus: true, maxerr: 500, indent: 4 */
// Structure types
(function (baselib,$) {
    "use strict";
    var exports = {};
    baselib.keywords = exports;


    //////////////////////////////////////////////////////////////////////
    
    // Keywords

    //////////////////////////////////////////////////////////////////////
    var Keyword = function (val) {
        this.val = val;
    };

    var keywordCache = new baselib.Dict();

    // makeKeyword: string -> Keyword.
    // Interns a keyword.
    var makeKeyword = function (val) {
        // To ensure that we can eq? keywords with equal values.
        if (!(keywordCache.has(val))) {
            keywordCache.set(val, new Keyword(val));
        }
        return keywordCache.get(val);
    };
    
    Keyword.prototype.equals = function (other, aUnionFind) {
        return other instanceof Keyword &&
            this.val === other.val;
    };

    Keyword.prototype.hashCode = function(depth) {
        var k = baselib.hashes.getEqualHashCode("Keyword");
        k = baselib.hashes.hashMix(k);
        k += baselib.hashes.getEqualHashCode(this.val);
        k = baselib.hashes.hashMix(k);
        return k;
    };
    

    Keyword.prototype.toString = function (cache) {
        return this.val;
    };

    Keyword.prototype.toWrittenString = function (cache) {
        return "#:" + this.val;
    };

    Keyword.prototype.toDisplayedString = function (cache) {
        return "#:" + this.val;
    };

    Keyword.prototype.toDomNode = function(params) {
        if (params.getMode() === 'write') {
            return $("<span/>").text(this.val).addClass('wescheme-keyword').get(0);
        }
        if (params.getMode() === 'display') {
            return $("<span/>").text(this.val).addClass('wescheme-keyword').get(0);
        }
        if (params.getMode() === 'print') {
            if (params.getDepth() === 0) {
                return $("<span/>").text("'" + this.val).addClass('wescheme-keyword').get(0);
            } else {
                return $("<span/>").text(this.val).addClass('wescheme-keyword').get(0);
            }
        }
        if (params.getMode() === 'constructor') {
            return $("<span/>").text("'" + this.val).addClass('wescheme-keyword').get(0);
        }

        return $("<span/>").text(this.val).addClass('wescheme-keyword').get(0);
    };
    


    var isKeyword = function (x) { return x instanceof Keyword; };




    //////////////////////////////////////////////////////////////////////

    exports.Keyword = Keyword;
    exports.makeKeyword = makeKeyword;
    exports.isKeyword = isKeyword;

}(this.plt.baselib, jQuery));
