# Javascript Refresher :computer:

This is a quick refresher on Javascript concepts which are required before diving into the world of nodejs :book:. It's designed to help you brush up on your Javascript skills :muscle: and get you up to speed with the concepts which are building blocks of nodejs :rocket:.

## First-class Functions

A programming language is said to have **First-class functions** when functions in that language are treated like any other variable. For example, in such a language, a function can be passed as an argument to other functions, can be returned by another function and can be assigned as a value to a variable.

JavaScript treat function as first-class-citizens. This means that functions are simply a value and are just another type of object.

### Examples

**Assigning a function to a variable**
```
const foo = () => {
  console.log("foobar");
};
foo(); // Invoke it using the variable
// foobar
```
We assigned an Anonymous Function in a Variable, then we used that variable to invoke the function by adding parentheses `()` at the end.

**Passing a function as an argument**
```
function sayHello() {
  return "Hello, ";
}
function greeting(helloMessage, name) {
  console.log(helloMessage() + name);
}
// Pass `sayHello` as an argument to `greeting` function
greeting(sayHello, "JavaScript!");
// Hello, JavaScript!
```
We are passing our `sayHello()` function as an argument to the `greeting()` function, this explains how we are treating the function as a value.

**Returning a function**
```
function sayHello() {
  return () => {
    console.log("Hello!");
  };
}
```
In this example, we are returning a function from another function - We can return a function because functions in JavaScript are treated as values