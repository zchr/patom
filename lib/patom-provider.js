'use babel'



export default class PatomProvider {
  constructor() {
    this.selector = '*.sql';
    this.inclusionPriority = 1;
    this.excludeLowerPriority = true;
    this.suggestionPriority = 2;

    this.columns = [];
  }


  getSuggestions(options) {
    let { prefix } = options;
    prefix = prefix.toLowerCase();


    return this.columns
      .filter(c => c.lower.includes(prefix))
      .map(c => {
        return {
          text: c.value
        }
      });
  }

  setSuggestions(columns) {
    this.columns = columns.map(c => {
      return {
        value: c,
        lower: c.toLowerCase()
      }
    });
  }
}
