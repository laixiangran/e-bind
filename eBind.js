/**
 * Created by laixiangran on 2018/4/20.
 * homepage：http://www.laixiangran.cn.
 */

!function() {

    /**
     * EBind构造函数
     * @param options
     * @constructor
     */
    function EBind(options) {
        this._init(options);
    }

    /**
     * 初始化构造函数
     * @param options
     * @private
     */
    EBind.prototype._init = function (options) {

        // options 为上面使用时传入的结构体，包括 el, data, methods
        this.$options = options;

        // el 是 #app, this.$el 是 id 为 app 的 Element 元素
        this.$el = document.querySelector(options.el);

        // this.$data = {number: 0}
        this.$data = options.data;

        // this.$methods = {increment: function () { this.number++; }}
        this.$methods = options.methods;

        // _binding 保存着 model 与 view 的映射关系，也就是我们定义的 Watcher 的实例。当 model 改变时，我们会触发其中的指令类更新，保证 view 也能实时更新
        this._binding = {};

        // 重写 this.$data 的 set 和 get 方法
        this._obverse(this.$data);

        // 解析指令
        this._complie(this.$el);
    };

    /**
     * 对data进行处理，重写相应的set和get函数
     * @param currentObj 当前对象
     * @param completeKey
     * @private
     */
    EBind.prototype._obverse = function (currentObj, completeKey) {
        var _this = this;
        Object.keys(currentObj).forEach(function (key) {
            if (currentObj.hasOwnProperty(key)) {

                // 按照前面的数据，_binding = {number: _directives: [], preson: _directives: [], preson.age: _directives: []}
                var completeTempKey = completeKey ? completeKey + '.' + key : key;
                _this._binding[completeTempKey] = {
                    _directives: []
                };
                var value = currentObj[key];

                // 如果值还是对象，则遍历处理
                if (typeof value === 'object') {
                    _this._obverse(value, completeTempKey);
                }
                var binding = _this._binding[completeTempKey];

                // 双向数据绑定的关键
                Object.defineProperty(currentObj, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        console.log(key + '获取' + JSON.stringify(value));
                        return value;
                    },
                    set: function (newVal) {
                        if (value !== newVal) {
                            console.log(key + '更新' + JSON.stringify(newVal));
                            value = newVal;

                            // 当 number 改变时，触发 _binding[number]._directives 中的绑定的 Watcher 类的更新
                            binding._directives.forEach(function (item) {
                                item.update();
                            });
                        }
                    }
                });
            }
        })
    };

    /**
     * 解析指令（e-bind、e-model、e-click）等，并在这个过程中对 view 与 model 进行绑定
     * @param root  root 为 id 为 app 的 Element 元素，也就是我们的根元素
     * @private
     */
    EBind.prototype._complie = function (root) {
        var _this = this;
        var nodes = root.children;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            // 对所有元素进行遍历，并进行处理
            if (node.children.length) {
                this._complie(node);
            }

            // 如果有 e-click 属性，我们监听它的 onclick 事件，触发 increment 事件，即 number++
            if (node.hasAttribute('e-click')) {
                node.onclick = (function () {
                    var attrVal = node.getAttribute('e-click');

                    // bind 是使 data 的作用域与 method 函数的作用域保持一致
                    return _this.$methods[attrVal].bind(_this.$data);
                })();
            }

            // 如果有 e-model 属性且元素是 INPUT 和 TEXTAREA，我们监听它的 input 事件，更改 model 的值
            if (node.hasAttribute('e-model') && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
                node.addEventListener('input', (function (index) {
                    var attrVal = node.getAttribute('e-model');

                    // 添加指令类 Watcher
                    _this._binding[attrVal]._directives.push(new Watcher({
                        name: 'input',
                        el: node,
                        eb: _this,
                        exp: attrVal,
                        attr: 'value'
                    }));

                    return function () {
                        var keys = attrVal.split('.');
                        var lastKey = keys[keys.length - 1];
                        var model = keys.reduce(function (value, key) {
                            if (typeof value[key] !== 'object') {
                                return value;
                            }
                            return value[key];
                        }, _this.$data);
                        model[lastKey] = nodes[index].value;
                    }
                })(i));
            }

            // 如果有 e-bind 属性
            if (node.hasAttribute('e-bind')) {
                var attrVal = node.getAttribute('e-bind');

                // 添加指令类 Watcher
                _this._binding[attrVal]._directives.push(new Watcher({
                    name: 'text',
                    el: node,
                    eb: _this,
                    exp: attrVal,
                    attr: 'innerHTML'
                }));
            }
        }
    };

    /**
     * 指令类Watcher，用来绑定更新函数，实现对DOM元素的更新
     * @param options Watcher 类属性：
     * name 指令名称，例如文本节点，该值设为"text"
     * el 指令对应的DOM元素
     * eb 指令所属EBind实例
     * exp 指令对应的值，本例如"number"
     * attr 绑定的属性值，本例为"innerHTML"
     * @constructor
     */
    function Watcher(options) {
        this.$options = options;
        this.update();
    }

    /**
     * 根据 model 更新 view
     */
    Watcher.prototype.update = function () {
        var _this = this;
        var keys = this.$options.exp.split('.');

        // 比如 H3.innerHTML = this.data.number; 当 number 改变时，会触发这个 update 函数，保证对应的 DOM 内容进行了更新。
        this.$options.el[this.$options.attr] = keys.reduce(function (value, key) {
            return value[key];
        }, _this.$options.eb.$data);
    };

    window.EBind = EBind;

}(window);