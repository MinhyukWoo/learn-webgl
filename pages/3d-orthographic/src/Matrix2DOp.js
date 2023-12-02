
class Matrix2DOp {
    /**
     *
     * @param {number[]} array1
     * @param {number[]} array2
     * @returns {number[] | null}
     */
    static multiply(array1, array2) {
      if (array1.length !== 9 || array2.length !== 9) {
        return null;
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
  
    static getIdentityArray() {
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }
  
    static getProjectionArray(width, height) {
      return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
    }
  }