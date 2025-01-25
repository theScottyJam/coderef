# Code-Ref

Link distant parts of your codebase together with randomly generated coderefs, either from [the coderef webpage](https://thescottyjam.github.io/coderef/) hosted from this branch, or using the `npx coderef` command, found on the master branch.

<br/>

## Example

someScript.js
```js
const el = document.querySelector('#someElement');
const color = '#00f'; // Search this project for §xRDEM to find other locations that use this color.
el.style.backgroundColor = color;
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

## License

This project is under the [MIT](https://opensource.org/licenses/MIT) license.
