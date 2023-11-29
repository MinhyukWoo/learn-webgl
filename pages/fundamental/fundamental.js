const vertexShaderStr = `
attribute vec4 a_position;
void main(){
    gl_Position = a_position;
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

  // 프로그램의 속성마다 위치를 js 변수에 저장하기 (이 작업은 렌더링 전에 해야 한다.)
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // 프로그램 속성에 데이터 전달을 위한 버퍼 생성
  const positionBuffer = gl.createBuffer(); // 빈 버퍼 생성
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 빈 버퍼를 연결하는 바인드 포인트 설정
  const positions = [
    0.0, 0.0, 0.0, 0.5, 0.7, 0.0, -0.1, -0.1, -0.5, 0, 0, -0.5,
  ]; // x와 y좌표로 구성된 배열, -1과 1 사이의 값을 넣어준다.
  gl.bufferData(
    gl.ARRAY_BUFFER, // 바인드 포인트, 전역적으로 사용할 수 있다.
    new Float32Array(positions), // TypedArray를 통해 정확한 타입으로 데이터 전달
    gl.STATIC_DRAW // WebGL의 최적화를 위해 앞으로 데이터를 어떻게 사용할지 설정, static_draw는 데이터가 많이 바뀌지 않을 때 사용
  ); // 바인드 포인트를 통해 빈 버퍼를 인자로 전달한 값으로 복사하여 초기화 함

  // 뷰 포트의 크기를 설정
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // -1 -> 0으로 1 -> canvas 크기로 설정

  // 캔버스 지우기
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 셰이더 연결
  gl.useProgram(program); // 셰이더를 연결한 프로그램을 현재 WebGL에서 사용할 것인지 설정

  // 버퍼에 있는 배열을 셰이더의 속성에 연결
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // positionBuffer 배열을 ARRAY_BUFFER에 바인딩한다.
  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size, // 한 position에 대한 차원 수
    type, // 데이터 타입
    normalize, // 데이터 정규화
    stride, // 0이면 다음 position을 읽기 위해 size * sizeof(type)만큼 앞으로 이동
    offset // 버퍼를 읽는데 시작하는 위치
  ); // 현재 바인딩 된 ARRAY_BUFFER의 배열을 GLSL의 속성으로 가져온다.

  // 프래그먼트 셰이더에 색상 값 연결
  gl.uniform4f(
    colorUniformLocation,
    Math.random(),
    Math.random(),
    Math.random(),
    1
  );

  // 정점 그리기
  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(
    primitiveType, // 그리는 방식 설정, TRIANGLES는 3번째 실행마다 삼각형을 그림
    offset,
    count // 정점 셰이더를 실행하는 횟수
  );
}

main();
