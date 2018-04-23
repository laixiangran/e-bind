# e-bind

实现简单的数据双向绑定，基于 Object.defineProperty。

实现了三个指令 `e-bind`、`e-model`、`e-click`。

## 使用示例

```html
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="author" content="赖祥燃, laixiangran@163.com, http://www.laixiangran.cn"/>
    <title>实现简单的双向数据绑定</title>
    <style>
        #app {
            text-align: center;
        }
    </style>
    <script src="eBind.js"></script>
    <script>
        window.onload = function () {
            new EBind({
                el: '#app',
                data: {
                    number: 0,
                    person: {
                        age: 0
                    }
                },
                methods: {
                    increment: function () {
                        this.number++;
                    },
                    addAge: function () {
                        this.person.age++;
                    }
                }
            });
        };
    </script>
</head>
<body>
<div id="app">
    <form>
        <input type="text" e-model="number">
        <button type="button" e-click="increment">增加</button>
    </form>
    <h3 e-bind="number"></h3>
    <form>
        <input type="text" e-model="person.age">
        <button type="button" e-click="addAge">增加</button>
    </form>
    <h3 e-bind="person.age"></h3>
</div>
</body>
```

