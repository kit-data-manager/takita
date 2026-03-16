export class Mode {
  static View = new Mode('view');
  static Create = new Mode('create');
  static Modify = new Mode('modify');
  static Move = new Mode('move');

  constructor(name) {
    this.name = name;
  }
}
