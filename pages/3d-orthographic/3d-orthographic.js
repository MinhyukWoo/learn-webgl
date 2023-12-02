import { EnumAxis, Matrix3D } from "./src/Matrix3D";
import positions from "./static/f-geometric.json";
import colors from "./static/f-texture.json";

const vertexShaderStr = `
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;

varying vec4 v_color;

void main(){
    gl_Position = u_matrix * a_position;

    v_color = a_color;
}
`;
const fragmentShaderStr = `
precision mediump float;

varying vec4 v_color;

void main(){
    gl_FragColor = v_color;
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
 * @param {Number[]} array
 */
function setGeometry(gl, buffer, array) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
}
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} attribLocation
 * @param {WebGLBuffer} buffer
 * @param {Number} numDimensions
 * @param {Number} numTriangles
 */
function drawTriagnles(
  gl,
  attribLocation,
  buffer,
  numDimensions,
  numTriangles
) {
  // 버퍼에 있는 배열을 셰이더의 속성에 연결
  gl.enableVertexAttribArray(attribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(attribLocation, numDimensions, gl.FLOAT, false, 0, 0);

  // 정점 그리기
  gl.drawArrays(gl.TRIANGLES, 0, 3 * numTriangles);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} attribLocation
 * @param {WebGLBuffer} buffer
 * @param {Number} numDimensions
 * @param {Number} numTriangles
 */
function paintTriagnles(
  gl,
  attribLocation,
  buffer,
  numDimensions,
  numTriangles
) {
  // 버퍼에 있는 배열을 셰이더의 속성에 연결
  gl.enableVertexAttribArray(attribLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    attribLocation,
    numDimensions,
    gl.UNSIGNED_BYTE,
    true,
    0,
    0
  );

  // 정점 그리기
  gl.drawArrays(gl.TRIANGLES, 0, 3 * numTriangles);
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
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

  // 전달 받은 데이터를 가지고 canvas에 그리기
  let positionBuffer = null;
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

  function draw(positions, translation, angle, scale, anchor, color) {
    // window 창 크기에 맞게 canvas 크기 조절
    resizeCanvasToDisplaySize(canvas);

    // 프로그램 속성에 데이터 전달을 위한 버퍼 생성
    if (positionBuffer) {
      gl.deleteBuffer(positionBuffer);
    }
    positionBuffer = gl.createBuffer();

    // 버퍼와 데이터 간 바인드
    setGeometry(gl, positionBuffer, positions);

    // 뷰 포트의 크기를 설정
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 캔버스 지우기
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 셰이더 연결
    gl.useProgram(program);
    const translationMatrix = Matrix3D.translationMatrix(...translation);
    const xRotationMatrix = Matrix3D.rotationMatrix(30, EnumAxis.X_AXIS);
    const yRotationMatrix = Matrix3D.rotationMatrix(30, EnumAxis.Y_AXIS);
    const zRotationMatrix = Matrix3D.rotationMatrix(angle, EnumAxis.Z_AXIS);
    const scaleMatrix = Matrix3D.scalingMatrix(...scale);
    const reversedAnchor = anchor.map((item) => -item);
    const anchorMatrix = Matrix3D.translationMatrix(...reversedAnchor);

    const identityMatrix = Matrix3D.identityMatrix();
    const matrices = [
      anchorMatrix,
      scaleMatrix,
      xRotationMatrix,
      yRotationMatrix,
      zRotationMatrix,
      translationMatrix,
      Matrix3D.projectionMatrix(gl.canvas.width, gl.canvas.height, 400),
    ];
    const matrix = matrices.reduce(
      (prevMatrix, matrix) => Matrix3D.multiply(matrix, prevMatrix),
      identityMatrix
    );

    // 셰이더의 uniform 속성 정의
    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

    // Triangles 방식으로 도형 그리기
    drawTriagnles(
      gl,
      positionAttributeLocation,
      positionBuffer,
      3,
      positions.length / 6
    );
    paintTriagnles(
      gl,
      colorAttributeLocation,
      colorBuffer,
      3,
      colors.length / 6
    );
  }

  function getPoints(positions, dimension, numDimension) {
    const points = positions.filter(
      (_, index) => index % numDimension === dimension
    );
    return points.filter((item, index) => points.indexOf(item) !== index);
  }

  function getCenterVector(positions, numDimension) {
    function getCenterPoint(points) {
      return (Math.max(...points) + Math.min(...points)) / 2;
    }

    return [...Array(numDimension)].map((_, index) =>
      getCenterPoint(getPoints(positions, index, numDimension))
    );
  }

  const center = getCenterVector(positions, 3);
  console.log(center);
  const translation = [200, 200, 0];
  const width = Math.max(...getPoints(positions, 0, 3));
  const color = [Math.random(), Math.random(), Math.random(), 1];
  const scale = [2, 1, 1];

  function animate(timestamp) {
    const sec = timestamp / 1000;
    translation[0] =
      ((sec * window.innerWidth - width) / 3) % (window.innerWidth - width);
    const angle = sec * 90;
    scale[0] = 2 * Math.sin(sec);
    draw(positions, translation, angle, scale, center, color);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

main();
