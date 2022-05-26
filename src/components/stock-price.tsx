import { h, Component, State } from '@stencil/core';

@Component({
  tag: 'kvm-stock-price',
  styleUrl: './stock-price.css',
  shadow: true,
})
export class StockPrice {
  @State() price: number;

  async onFetchData(event: Event) {
    event.preventDefault();
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${process.env.API_KEY}`);
      const data = await response.json();
      this.price = +data['Global Quote']['05. price'];
    } catch {
      console.log('error');
    }
  }

  render() {
    return [
      <form onSubmit={this.onFetchData.bind(this)}>
        <input />
        <button type="submit">
          <span>Fetch data</span>
        </button>
      </form>,
      <div>
        <span>Price: ${this.price}</span>
      </div>,
    ];
  }
}
