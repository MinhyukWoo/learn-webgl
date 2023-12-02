export const EnumAxis = {
  X_AXIS: 0,
  Y_AXIS: 1,
  Z_AXIS: 2,
};

Object.freeze(EnumAxis);

export class Matrix3D {
  /**
   *
   * @param {number[]} array1
   * @param {number[]} array2
   * @returns {number[] | null}
   */
  static multiply(array1, array2) {
    if (array1.length !== 16 || array2.length !== 16) {
      return null;
    }
    var b00 = array2[0 * 4 + 0];
    var b01 = array2[0 * 4 + 1];
    var b02 = array2[0 * 4 + 2];
    var b03 = array2[0 * 4 + 3];
    var b10 = array2[1 * 4 + 0];
    var b11 = array2[1 * 4 + 1];
    var b12 = array2[1 * 4 + 2];
    var b13 = array2[1 * 4 + 3];
    var b20 = array2[2 * 4 + 0];
    var b21 = array2[2 * 4 + 1];
    var b22 = array2[2 * 4 + 2];
    var b23 = array2[2 * 4 + 3];
    var b30 = array2[3 * 4 + 0];
    var b31 = array2[3 * 4 + 1];
    var b32 = array2[3 * 4 + 2];
    var b33 = array2[3 * 4 + 3];
    var a00 = array1[0 * 4 + 0];
    var a01 = array1[0 * 4 + 1];
    var a02 = array1[0 * 4 + 2];
    var a03 = array1[0 * 4 + 3];
    var a10 = array1[1 * 4 + 0];
    var a11 = array1[1 * 4 + 1];
    var a12 = array1[1 * 4 + 2];
    var a13 = array1[1 * 4 + 3];
    var a20 = array1[2 * 4 + 0];
    var a21 = array1[2 * 4 + 1];
    var a22 = array1[2 * 4 + 2];
    var a23 = array1[2 * 4 + 3];
    var a30 = array1[3 * 4 + 0];
    var a31 = array1[3 * 4 + 1];
    var a32 = array1[3 * 4 + 2];
    var a33 = array1[3 * 4 + 3];

    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  }

  static translationMatrix(tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  }

  /**
   *
   * @param {Number} degree
   * @param {Number} enumAxis
   * @returns
   */
  static rotationMatrix(degree, enumAxis) {
    const radian = (Math.PI * degree) / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    if (enumAxis === EnumAxis.Z_AXIS) {
      return [cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    } else if (enumAxis === EnumAxis.X_AXIS) {
      return [1, 0, 0, 0, 0, cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1];
    } else if (enumAxis === EnumAxis.Y_AXIS) {
      return [cos, 0, -sin, 0, 0, 1, 0, 0, sin, 0, cos, 0, 0, 0, 0, 1];
    } else {
      return null;
    }
  }

  static scalingMatrix(sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  }

  static identityMatrix() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  static projectionMatrix(width, height, depth) {
    return [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      2 / depth,
      0,
      -1,
      1,
      0,
      1,
    ];
  }

  static translate(matrix, tx, ty, tz) {
    return Matrix3D.multiply(matrix, Matrix3D.translationMatrix(tx, ty, tz));
  }

  static rotate(matrix, degree, enumAxis) {
    return Matrix3D.multiply(matrix, Matrix3D.rotationMatrix(degree, enumAxis));
  }

  static scale(matrix, sx, sy, sz) {
    return Matrix3D.multiply(matrix, Matrix3D.scalingMatrix(sx, sy, sz));
  }

  static project(matrix, width, height) {
    return Matrix3D.multiply(matrix, Matrix3D.projectionMatirx(width, height));
  }
}
