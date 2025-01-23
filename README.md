# Code-Ref

Keep distant parts of your code base in sync by using searchable cross-references.

It's a simple, yet powerful concept. Just run `npx coderef` to copy a unique tag to your clipboard (like `§SDyBm`), then use it to link different parts of your codebase together.

<br/>

## Example

someScript.js
```js
const el = document.querySelector('#someElement')
const color = '#00f' // Search this project for §xRDEM to find other locations that use this color.
el.style.backgroundColor = color
```
pageStyle.css
```css
body {
    /* Search this project for §xRDEM to find other locations that use this color. */
    color: #00f;
}
```

Anyone reading this code can know that if they use their favorite project-searching tool (via their editor, grep, etc), they can easily find all related pieces of code.

<br/>

**Happy Coding!**

<br/>
<br/>

## API

If for some reason you choose to install and import this package, you will find it exposes a single `generate` function, which, when called, returns a randomly generated tag.

## License

This project is under the [MIT](https://opensource.org/licenses/MIT) license.

## Bug Reports/Feature Requests

[This project's github repository can be found here](https://github.com/theScottyJam/coderef). Bug reports and feature requests are welcome, and can be submitted on github.