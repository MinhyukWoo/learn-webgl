const vertexShaderStr = `
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
void main(){
    vec2 position = a_position + u_translation;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;
const fragmentShaderStr = `
precision mediump float;

uniform vec4 u_color;
void main(){
    gl_FragColor = u_color;
}
`;

/**
 *
 * @param {WebGLRenderingContext} gl
 * @returns {WebGLShader | null}
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  } else {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 * @returns {WebGLProgram | null}
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  } else {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLBuffer} gl
 * @param {Number} left
 * @param {Number} top
 * @param {Number} width
 * @param {Number} height
 */
function setRectangle(gl, buffer, left, top, width, height) {
  const right = left + width;
  const bottom = top + height;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      left,
      top,
      right,
      top,
      left,
      bottom,
      left,
      bottom,
      right,
      top,
      right,
      bottom,
    ]),
    gl.STATIC_DRAW
  );
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Number[]} array
 */
function set2DGeometry(gl, buffer, array) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} attribLocation
 * @param {WebGLBuffer} buffer
 */
function drawRectangle(gl, attribLocation, buffer) {
  // 버퍼에 있는 배열을 셰이더의 속성에 연결
  gl.enableVertexAttribArray(attribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);

  // 정점 그리기
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} attribLocation
 * @param {WebGLBuffer} buffer
 */
function draw2DTriangles(gl, attribLocation, buffer, cntTriangles) {
  gl.enableVertexAttribArray(attribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, cntTriangles * 3);
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Number} width
 * @param {Number} height
 */
function resizeCanvas(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvasToDisplaySize(canvas) {
  resizeCanvas(canvas, window.innerWidth, window.innerHeight);
}

function main() {
  // WebGL 컨텍스트 가져오기
  const canvas = document.getElementById("main-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const gl = canvas.getContext("webgl");

  // vertex와 fragment에 대한 WebGL shader 생성
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderStr);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderStr
  );

  // 두 셰이더를 프로그램으로 연결
  const program = createProgram(gl, vertexShader, fragmentShader);

  // 프로그램의 속성마다 위치를 js 변수에 저장하기
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const translationUniformLocation = gl.getUniformLocation(
    program,
    "u_translation"
  );
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  function draw(positions, translation, color) {
    resizeCanvasToDisplaySize(canvas);
    // 프로그램 속성에 데이터 전달을 위한 버퍼 생성
    const positionBuffer = gl.createBuffer();
    // setRectangle(gl, positionBuffer, translation[0], translation[1], width, 20);

    set2DGeometry(gl, positionBuffer, positions);

    // 뷰 포트의 크기를 설정
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 캔버스 지우기
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 셰이더 연결
    gl.useProgram(program); // 셰이더를 연결한 프로그램을 현재 WebGL에서 사용할 것인지 설정

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2fv(translationUniformLocation, translation);
    gl.uniform4fv(colorUniformLocation, color);

    // drawRectangle(gl, positionAttributeLocation, positionBuffer);
    draw2DTriangles(gl, positionAttributeLocation, positionBuffer, 6);
  }

  const translation = [0, 10];
  const positions = [
    // 왼쪽 열
    0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,
    // 상단 가로 획
    30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,
    // 중간 가로 획
    30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
  ];
  const width = Math.max(...positions.filter((_, index) => index % 2 === 0));
  const color = [Math.random(), Math.random(), Math.random(), 1];

  function animate(timestamp) {
    const sec = timestamp / 1000;
    translation[0] =
      ((sec * window.innerWidth - width) / 3) % (window.innerWidth - width);
    //   console.log(translation)
    draw(positions, translation, color);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

main();
