export default class SimpleFragmentCanvas extends HTMLElement {
  default_vertex_shader = `#version 300 es
    precision mediump float;

    attribute vec4 a_position;

    void main() {
        gl_Position = a_position;
    }`

  shader_types = {
    vert: () => this.gl.VERTEX_SHADER,
    frag: () => this.gl.FRAGMENT_SHADER
  }

  resizeevent = new window.Event('resize')
  refreshevent = new window.Event('refresh')
  dpr = window.devicePixelRatio

  constructor({shader} = {}) {
    super()

    this.attachShadow({mode: 'open'});
    this.canvas = document.createElement('canvas');
    this.shadowRoot.appendChild(this.canvas);

    this.style.setProperty('display', 'block')
    this.style.setProperty('overflow', 'hidden')
    this.style.setProperty('box-sizing', 'border-box')
    this.style.setProperty('width', '100%')
    this.style.setProperty('height', '100%')

    this.canvas.style.setProperty('width', '100%')
    this.canvas.style.setProperty('height', '100%')

    this._gl = this.canvas.getContext('webgl2')
    if (!this._gl) console.error('webgl2 not available in this browser')
    this._program = this._gl.createProgram()

    this._resizeObserver = new window.ResizeObserver(this.resize.bind(this))
    this._resizeObserver.observe(this)

    if (shader) this.setAttribute('data-shader', shader)
  }

  get gl() {
    return this._gl
  }

  get program() {
    return this._program
  }

  connectedCallback() {
    fetch(this.getAttribute('data-shader'))
      .then(resp => resp.text())
      .then(text => {
        return [
          this.createShader('vert', this.default_vertex_shader),
          this.createShader('frag', text)
        ]
      })
      .then(shaders => {
        const program = this.linkProgram.call(this, shaders)
        this.dispatchEvent(this.resizeevent)
        window.requestAnimationFrame(this.refresh.bind(this))
        return program
      })
  }

  createShader(type, src) {
    const shader = this.gl.createShader(this.shader_types[type]())
    this.gl.shaderSource(shader, src)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      console.error(`ERROR compiling ${src} shader`, this.gl.getShaderInfoLog(shader))
    return shader
  }

  linkProgram(shaders) {
    shaders.forEach(this.gl.attachShader.bind(this.gl, this.program))
    this.gl.linkProgram(this.program)
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
      console.error('ERROR linking program', this.gl.getProgramInfoLog(this.program))
    this.gl.validateProgram(this.program)
    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS))
      console.error('ERROR validating program', this.gl.getProgramInfoLog(this.program))
    return this.program
  }

  refresh() {
    this.loop.call(this)
    this.dispatchEvent(this.refreshevent)
    window.requestAnimationFrame(this.refresh.bind(this))
  }

  resize() {
    let {width, height} = this.getBoundingClientRect()

    this.canvas.width = width * this.dpr
    this.canvas.height = height * this.dpr
    this.gl.viewport(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }

  clear(...colorPoints) {
    this.gl.clearColor(...colorPoints)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  loop() {
    this.clear(0.0, 0.0, 0.0, 0.0)
  }

  resize() {}
}

window.customElements.define('simple-fragment-canvas', SimpleFragmentCanvas)
