
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "ogl" {
  export class Renderer {
    constructor(opts?: any);
    domElement: HTMLCanvasElement;
    render(args?: any): void;
  }
  export class Camera {}
  export class Transform {}
  export class Plane {}
  export class Program {}
  export class Mesh {}
  export class Triangle {} 
}
