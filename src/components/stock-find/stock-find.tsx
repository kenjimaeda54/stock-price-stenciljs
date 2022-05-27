import { h, Component, State } from '@stencil/core';

@Component({
  tag: 'kvm-stock-find',
  styleUrl: './styles.css',
  shadow: true,
})
export class StockFind {
  @State() findStock: string;

  async handleSubmit(event: Event) {
    event.preventDefault();
    console.log(this.findStock);
    try {
      console.log('entrou aqui');
      const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${this.findStock}&apikey=${process.env.API_KEY}`);
      const data = await response.json();
      console.log(data);
    } catch {
      console.log('error');
    }
  }

  handleInput(event: Event) {
    this.findStock = (event.target as HTMLInputElement).value;
  }

  render() {
    return [
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input value={this.findStock} onInput={this.handleInput.bind(this)} />
        <button type="submit">
          <span>Find</span>
        </button>
      </form>,
    ];
  }
}
