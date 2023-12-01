const vertexShaderStr = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_matrix;
void main(){
    vec2 position = (u_matrix * vec3(a_position, 1)).xy;
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

class Matrix2DOp {
  /**
   *
   * @param {number[]} array1
   * @param {number[]} array2
   * @returns {number[]}
   */
  static multiply(array1, array2) {
    if (array1.length !== 9 || array2.length !== 9) {
      return;
    }
    const a00 = array1[0 * 3 + 0];
    const a01 = array1[0 * 3 + 1];
    const a02 = array1[0 * 3 + 2];
    const a10 = array1[1 * 3 + 0];
    const a11 = array1[1 * 3 + 1];
    const a12 = array1[1 * 3 + 2];
    const a20 = array1[2 * 3 + 0];
    const a21 = array1[2 * 3 + 1];
    const a22 = array1[2 * 3 + 2];
    const b00 = array2[0 * 3 + 0];
    const b01 = array2[0 * 3 + 1];
    const b02 = array2[0 * 3 + 2];
    const b10 = array2[1 * 3 + 0];
    const b11 = array2[1 * 3 + 1];
    const b12 = array2[1 * 3 + 2];
    const b20 = array2[2 * 3 + 0];
    const b21 = array2[2 * 3 + 1];
    const b22 = array2[2 * 3 + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  }

  static getTranslationArray(x, y) {
    return [1, 0, 0, 0, 1, 0, x, y, 1];
  }

  static getRotationArray(angle) {
    const radian = (Math.PI * angle) / 180;
    const c = Math.cos(radian);
    const s = Math.sin(radian);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  }

  static getScalingArray(x, y) {
    return [x, 0, 0, 0, y, 0, 0, 0, 1];
  }
}

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
    console.error(gl.getShaderInfoLog(shader));
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
    console.error(gl.getProgramInfoLog(program));
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

/**
 * @param {Number} angle
 */
function getRotation(angle) {
  return [Math.sin(angle), Math.cos(angle)];
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
  const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // 전달 받은 데이터를 가지고 canvas에 그리기
  let positionBuffer = null;
  function draw(positions, translation, angle, center, color) {
    // window 창 크기에 맞게 canvas 크기 조절
    resizeCanvasToDisplaySize(canvas);

    // 프로그램 속성에 데이터 전달을 위한 버퍼 생성
    if (positionBuffer) {
      gl.deleteBuffer(positionBuffer);
    }
    positionBuffer = gl.createBuffer();

    // 버퍼와 데이터 간 바인드
    set2DGeometry(gl, positionBuffer, positions);

    // 뷰 포트의 크기를 설정
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 캔버스 지우기
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 셰이더 연결
    gl.useProgram(program);

    const translationMatrix = Matrix2DOp.getTranslationArray(...translation);
    const rotationMatrix = Matrix2DOp.getRotationArray(angle);
    const reversedCenter = center.map((item) => -item);
    const centerMatrix = Matrix2DOp.getTranslationArray(...reversedCenter);

    const matrix = Matrix2DOp.multiply(translationMatrix, rotationMatrix);

    // 셰이더의 uniform 속성 정의
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
    gl.uniform4fv(colorUniformLocation, color);

    // Triangles 방식으로 도형 그리기
    draw2DTriangles(
      gl,
      positionAttributeLocation,
      positionBuffer,
      positions.length / 6
    );
  }

  const positions = [
    // 왼쪽 열
    0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,
    // 상단 가로 획
    30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,
    // 중간 가로 획
    30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
  ];

  function getPoints(positions, dimension) {
    const points = positions.filter((_, index) => index % 2 === dimension);
    return points.filter((item, index) => points.indexOf(item) !== index);
  }

  function get2DCenter(positions) {
    function getCenterPoint(points) {
      const infos = points.reduce(
        ([sum, length], x) => [sum + x, length + 1],
        [0, 0]
      );
      return infos[0] / infos[1];
    }
    return [
      getCenterPoint(getPoints(positions, 0)),
      getCenterPoint(getPoints(positions, 1)),
    ];
  }

  const center = get2DCenter(positions);
  const translation = [0, 200];
  const width = Math.max(...getPoints(positions, 0));
  const color = [Math.random(), Math.random(), Math.random(), 1];

  function animate(timestamp) {
    const sec = timestamp / 1000;
    translation[0] =
      ((sec * window.innerWidth - width) / 3) % (window.innerWidth - width);
    const angle = sec * 90;
    draw(positions, translation, angle, center, color);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

main();
