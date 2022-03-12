export enum UserInputMap {
  ADD = 'ShiftLeft',
}

export default class UserInput {
  keys: UserInputMap[] = [];
  events: Record<string, (inputs: UserInputMap[]) => void>[] = [];

  constructor() {
    document.addEventListener('keydown', event => {
      this.handleKeyEvent(event, true);
      this.dispatchEvent('keydown');
    });

    document.addEventListener('keyup', event => {
      this.handleKeyEvent(event, false);
      this.dispatchEvent('keyup');
    });
  }

  private handleKeyEvent({code}: KeyboardEvent, isDown: boolean): void {
    if (Object.values(UserInputMap).includes(code as UserInputMap)) {
      this.manageInput(code as UserInputMap, isDown);
    }
  }

  private manageInput(key: UserInputMap, isDown: boolean): void {
    if (this.keys.includes(key)) {
      this.keys.splice(this.keys.indexOf(key), Number(!isDown));
      return;
    }

    if (isDown) {
      this.keys.push(key);
    }
  }

  addEventListener(
    name: string,
    handler: (inputs: UserInputMap[]) => void
  ): void {
    this.events.push({
      [name]: handler,
    });
  }

  dispatchEvent(name: string) {
    this.events
      .filter(event => event[name])
      .forEach(event => event[name](this.keys));
  }
}
