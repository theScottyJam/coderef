# Code-Ref

Keep distant parts of your code base in sync by using searchable cross-references.

It's a simple, yet powerful concept. Just run `npx coderef` to copy a unique tag to your clipboard (like `§SDyBm`), then use it to link different parts of your codebase together.

<br/>

## Example

someScript.js
```js
const el = document.querySelector('#someElement')
const color = '#00f' // §xRDEM - This is the same color as the page's font color
el.style.backgroundColor = color
```
pageStyle.css
```css
body {
    /* §xRDEM - This is the same color as #someElement's background */
    color: #00f;
}
```

Assuming your team is all on the same page, anyone team member updating these colors will know to search the project (with grep, their code editor, etc) for the tag `§xRDEM` to find all other places that may need updating.

<br/>

## Implications

Now that you've seen this concept, you won't be able to unsee it. We're creating abstractions left and right to make code more DRY, and a good handful of them can simply be replaced with a couple of code tags.

**Happy Coding!**

<br/>
<br/>

## API

If for some reason you choose to install and import this package, you will find it exposes a single `generate` function, which, when called, returns a randomly generated tag.

## License

This project is under the [MIT](https://opensource.org/licenses/MIT) license.

## Bug Reports/Feature Requests

This project's github repository can be found [here](https://github.com/theScottyJam/coderef). Bug reports and feature requests are welcome, and can be submitted on github.