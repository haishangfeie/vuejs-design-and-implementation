// 目标:obj.text改变时，副作用函数可以自动执行

const obj = {
  text: 'hello world',
};
function effect() {
  document.body.innerText = obj.text;
}

obj.text = 'hello vue';
