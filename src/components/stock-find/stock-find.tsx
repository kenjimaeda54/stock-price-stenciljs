import { h, Component, State, Event, EventEmitter } from '@stencil/core';

type StockProps = {
  symbol: string;
  name: string;
};

@Component({
  tag: 'kvm-stock-find',
  styleUrl: './styles.css',
  shadow: true,
})
export class StockFind {
  @State() findStock: string;
  @State() stock: StockProps[];
  @State() symbolAtribute: string;

  //estou criando um custom evento,bubbles e composed e para permitir qeu o evento seja capturado fora dessa classe
  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<string>;

  async handleSubmit(event: Event) {
    event.preventDefault();
    try {
      console.log('entrou aqui');
      const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${this.findStock}&apikey=${process.env.API_KEY}`);
      const data = await response.json();
      this.stock = data['bestMatches'].map((it: StockProps) => {
        return {
          symbol: it['1. symbol'],
          name: it['2. name'],
        };
      });
    } catch {
      console.log('error');
    }
  }

  handleInput(event: Event) {
    this.findStock = (event.target as HTMLInputElement).value;
  }

  handleSymbolSelected(symbol: string) {
    //basicamente vou enviar a minha string pelo evento,e sera através do  event.detail que recebo ela
    //https://stenciljs.com/docs/events
    this.ucSymbolSelected.emit(symbol);
    this.symbolAtribute = symbol;
  }

  render() {
    return [
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input value={this.findStock} onInput={this.handleInput.bind(this)} />
        <button type="submit">
          <span>Find</span>
        </button>
      </form>,
      <ul>
        {this.stock &&
          this.stock.map(it => (
            <li class={this.symbolAtribute === it.symbol && 'selectedSymbol'} onClick={this.handleSymbolSelected.bind(this, it.symbol)}>
              <strong>{it.symbol}</strong> - {it.name}
            </li>
          ))}
      </ul>,
    ];
  }
}
