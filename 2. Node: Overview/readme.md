# NodeJs : an Overview ✨

Node.js is an open-source, server-side JavaScript runtime environment built on Chrome's V8 JavaScript engine. It allows you to run JavaScript code outside of a web browser, making it a popular choice for building scalable network applications and web servers.

**Some key features of Node.js include:**

- 🚀 **Asynchronous and Event-driven:** Node.js uses an event-driven, non-blocking I/O model, which makes it efficient and lightweight. It can handle a large number of concurrent connections without blocking the execution of other operations. 
- 🌐 **Web Development:** Node.js has a vast ecosystem of modules and packages that enable developers to build web applications easily. It provides frameworks like Express.js, which simplifies the process of building web servers and APIs. 
- 💡**JavaScript Everywhere:** Node.js allows developers to use JavaScript on both the server-side and client-side, making it easier to share code and logic between the front-end and back-end of an application.

Hold up! 😮 These are a hell lot of terms to begin with!! 🤯


So let's start from the very beginning 🌟🚀.

## Processors, Machine Language, and C++

In order to have a proper mental model of NodeJs, we first have to have an accurate understanding of it's core - The thing at the heart of nodejs - **The V8 Javascript Engine**.

To begin with, we need to understand Processors, Machine Code and C++... and before you say "Hey!! I'm here to learn about Nodejs and writing javascript", well, just hang with me.


So, first of all, let's talk about the thing that's sitting inside your computer right now as you're reading this documentation, and that's your **microprocessor**.

![microprocessor](../assets/microprocessor.png)

- A processor, in very layman terms is a machine with very small parts that work in andem with electrical inputs and ultimately do a job. 
- We give the microprocessor instructions. Now, not all microprocessors are the same. In fact, they don't all speak the exact same language.
- When we give a microprocessor some instructions, it has to be given in some language that it understands.
- There are variety of sets of instructions, or languages that microprocessors may be designed to speak. Some of these lanuages are : 
  - IA-32
  - x86-64
  - ARM
  - MIPS
- So basically, a microprocessor is a machine that accepts a certain set of instructions and carries them out, and these instructions (which can be in variety of languages, and the microprocessor will speak in one of them) is computer code, which we are giving directly to machine, called as **Machine Code**.
- **Machine Code (Language):** Programming Languages spoken by Computer Processors. Every program that runs on your computer eventually is converted to (compiled to) Machine Code, and then run by the Processor. 
  An example machine code:
  ![Machine Code](./../assets/machine-code.png)

As machine code varies from processor to processor, very difficult to understand and write, we write code in laguages that are converted or compiled into machine code.

So as time passed by, we built more and more languages on top of other and eventually got abstracted very far away from the processor. We moved from Machine Code to **Assembly language** which was still pretty close to machine, to **C & C++**, a high level language which still do have a high level control of things, to **Javascript** a very very high level language very far from machine and we don't have to directly deal with memory and all.
![Abstraction](./../assets/abstraction.png)

Pretty interesting right 💫, how we moved from as low as machine code to ver very far from machine to Javascript. So now let's dive into **Nodejs**, and specifically **Chrome V8 Engine**🚀.
