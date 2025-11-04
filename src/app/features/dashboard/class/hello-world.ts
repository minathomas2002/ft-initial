export class HelloWorldGreeter {
  constructor(public name: string) {}

  public sayHello(): void {
    console.log(`Hello, ${this.name}!`);
  }
}
