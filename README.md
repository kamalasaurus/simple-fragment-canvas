# Simple Fragment Canvas

This project is a custom HTML element that extends `HTMLElement` to create a simple WebGL canvas for fragment shaders.

## Features

- WebGL 2.0 support
- Fullscreen quad rendering
- Shader loading from external files
- Automatic canvas resizing

## Usage

To use this custom element in your HTML, simply include the JavaScript file and use the `simple-fragment-canvas` tag in your HTML. You can specify the fragment shader file using the `data-shader` attribute.

```html
<script src="simple-fragment-canvas.js"></script>
<simple-fragment-canvas data-shader="path/to/your/shader.frag"></simple-fragment-canvas>
```

or

```javascript
import SimpleFragmentCanvas from './simple-fragment-canvas.js'

const simple_fragment_canvas = new SimpleFragmentCanvas({
  shader: 'path/to/your/shader.frag'
})

document.body.appendChild(simple_fragment_canvas)
```


## Development

This project is developed using modern JavaScript features and WebGL 2.0. To contribute, simply clone the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License.
