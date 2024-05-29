// Define a custom HTML element that extends HTMLElement
export default class SimpleFragmentCanvas extends HTMLElement {
  
  // Define the default vertex shader as a string
  default_vertex_shader = `#version 300 es
    precision mediump float;

    in vec4 a_position;

    void main() {
        gl_Position = a_position;
    }`

  // Define the vertices for a fullscreen quad
  fullscreen_quad_vertices = [
    -1.0,  1.0,  // top left
    -1.0, -1.0,  // bottom left
    1.0,  1.0,  // top right
    1.0, -1.0   // bottom right
  ]

  // Define a mapping from shader type names to WebGL constants
  shader_types = {
    vert: () => this.gl.VERTEX_SHADER,
    frag: () => this.gl.FRAGMENT_SHADER
  }

  // Define a new resize event
  resizeevent = new window.Event('resize')
  
  // Get the device pixel ratio
  dpr = window.devicePixelRatio

  // Define the constructor for the custom element
  constructor({shader} = {}) {
    // Call the constructor of the parent class
    super()

    // Attach a shadow root to the custom element
    this.attachShadow({mode: 'open'})
    this.canvas = document.createElement('canvas')
    this.shadowRoot.appendChild(this.canvas)

    // Style the containing element to fill its parent
    this.style.setProperty('display', 'block')
    this.style.setProperty('overflow', 'hidden')
    this.style.setProperty('box-sizing', 'border-box')
    this.style.setProperty('width', '100%')
    this.style.setProperty('height', '100%')

    // Set the canvas width and height to 100%
    this.canvas.style.setProperty('width', '100%')
    this.canvas.style.setProperty('height', '100%')

    // Get the WebGL 2 context from the canvas
    this._gl = this.canvas.getContext('webgl2')

    // If WebGL 2 is not available, log an error
    if (!this._gl) console.error('webgl2 not available in this browser')

    // Create a new WebGL program
    this._program = this._gl.createProgram()

    // Create a new ResizeObserver to handle resize events
    this._resizeObserver = new window.ResizeObserver(this.resize.bind(this))

    // Start observing resize events on this element
    this._resizeObserver.observe(this)

    // Initialize the vertex array object to null
    this.vertex_array_object = null

    // Initialize the start time to 0
    this.start_time = 0

    // If a shader is provided, set it as a data attribute
    if (shader) this.setAttribute('data-shader', shader)
  }

  // Getter for the WebGL context
  get gl() {
    return this._gl
  }

  // Getter for the WebGL program
  get program() {
    return this._program
  }

  // Called when the element is connected to the DOM
  async connectedCallback() {
    // Fetch the shader code from the URL specified in the data-shader attribute
    return await fetch(this.getAttribute('data-shader'))
      .then(resp => resp.text())  // Get the response text
      .then(text => {
        // Create the vertex and fragment shaders
        return [
          this.createShader('vert', this.default_vertex_shader),
          this.createShader('frag', text)
        ]
      })
      .then(shaders => {
        // Link the shaders to the program
        this.linkProgram.call(this, shaders)
        // Create the vertex array object
        this.createVertexArrayObject.call(this)
        // Dispatch a resize event
        this.dispatchEvent(this.resizeevent)
        // Set the start time to the current time
        this.start_time = performance.now()
        // Request an animation frame to refresh the canvas
        window.requestAnimationFrame(this.refresh.bind(this))
        return true
      })
  }

  // Function to create a shader
  createShader(type, src) {
    // Create the shader
    const shader = this.gl.createShader(this.shader_types[type]())
    // Set the shader source
    this.gl.shaderSource(shader, src)
    // Compile the shader
    this.gl.compileShader(shader)
    // If the shader didn't compile successfully, log an error
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      console.error(`ERROR compiling ${src} shader`, this.gl.getShaderInfoLog(shader))
    // Return the shader
    return shader
  }

  // Function to link shaders to a program
  linkProgram(shaders) {
    // Attach each shader to the program
    shaders.forEach(this.gl.attachShader.bind(this.gl, this.program))
    
    // Link the program
    this.gl.linkProgram(this.program)
    
    // If the program didn't link successfully, log an error
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
      console.error('ERROR linking program', this.gl.getProgramInfoLog(this.program))
    
    // Validate the program
    this.gl.validateProgram(this.program)
    
    // If the program didn't validate successfully, log an error
    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS))
      console.error('ERROR validating program', this.gl.getProgramInfoLog(this.program))
    
    // Use the program
    this.gl.useProgram(this.program)
    
    // Return the program
    return this.program
  }

  // Function to create a vertex array object for efficient rendering
  createVertexArrayObject() {
    // Create a buffer for the vertices
    const vertexBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.fullscreen_quad_vertices), this.gl.STATIC_DRAW)
  
    // Create a VAO
    const vao = this.gl.createVertexArray()
    this.gl.bindVertexArray(vao)
  
    // Set up the vertex attribute pointers
    const positionLocation = this.gl.getAttribLocation(this.program, "a_position")
    this.gl.enableVertexAttribArray(positionLocation)
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)

    // Assign the VAO to the vertex_array_object property so it can be accessed later
    this.vertex_array_object = vao

    // Unbind the VAO
    this.gl.bindVertexArray(null)
  }

  refresh() {
    this.loop.call(this)
    window.requestAnimationFrame(this.refresh.bind(this))
  }

  resize() {
    let {width, height} = this.getBoundingClientRect()

    // Set the canvas width and height and adjust it according to the device pixel ratio
    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
  
    // Set the viewport to cover the entire canvas
    this.gl.viewport(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  // Function to clear the canvas with a specified color
  clear(...colorPoints) {
    // Set the clear color
    this.gl.clearColor(...colorPoints)
    // Clear the color and depth buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  // Function to render a frame
  loop() {
    // Clear the canvas with black color
    this.clear(0.0, 0.0, 0.0, 0.0)
    // Bind the vertex array object
    this.gl.bindVertexArray(this.vertex_array_object)
    // Draw the fullscreen quad
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  
    // Get the location of the u_resolution uniform
    const u_resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution")
    // Set the value of the u_resolution uniform
    this.gl.uniform2f(u_resolutionLocation, this.canvas.width, this.canvas.height)

    // Get the elapsed time in seconds
    const elapsedTime = (performance.now() - this.start_time) / 1000.0
    // Get the location of the u_time uniform
    const u_timeLocation = this.gl.getUniformLocation(this.program, "u_time")

    // Set the value of the u_time uniform
    this.gl.uniform1f(u_timeLocation, elapsedTime);

    // Unbind the VAO when done
    this.gl.bindVertexArray(null)
  }
}

// Register the custom element with the browser
window.customElements.define('simple-fragment-canvas', SimpleFragmentCanvas)