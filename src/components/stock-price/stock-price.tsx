import { h, Component, State, Prop, Watch, Listen } from '@stencil/core';

@Component({
  tag: 'kvm-stock-price',
  styleUrl: './stock-price.css',
  shadow: true,
})
export class StockPrice {
  @State() price: number | null;
  @State() stockSymbol: string;
  @State() isValidInput = false;
  @State() error: string | null;
  @State() isLoading = false;

  @Prop({ mutable: true, reflect: true }) stockDefault: string; //isto e convertido do camel case para stock-default

  //https://stenciljs.com/docs/events
  //mando evento customizado pelo @Event e capturo pelo listener o target e o body ou seja <body>qualquer evento daqui disparado </body>
  //precisa ser o nome do evento que criei
  @Listen('ucSymbolSelected', { target: 'body' })
  symbolSelectedHandler(event: CustomEvent<string>) {
    //vou receber valor que passei pelo emit do event no event.detail
    if (event.detail && event.detail !== this.stockDefault) {
      this.error = null;
      this.stockDefault = event.detail;
    }
  }

  //estou colando uma propriedade para observar se a props mudou
  //ou seja se mudar no html reflete aqui <kvm-stock-price stock-default="reflete"  >
  @Watch('stockDefault')
  watchStockDefault(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.stockSymbol = newValue;
      this.isValidInput = true;
      this.fetchData(newValue);
    }
  }

  onFetchData(event: Event) {
    event.preventDefault();
    //automaticamente se eu alterar a prop stockDefault vai refletir no método @Watch,por isso nao preciso chamar
    //fetchData
    this.stockDefault = this.stockSymbol;
  }

  //componente e chamado na primeira vez que ocorre primeiro render
  // precisa o componente estar totalmente carregado
  //https://stenciljs.com/docs/component-lifecycle#componentdidload
  componentDidLoad() {
    if (this.stockDefault) {
      this.stockSymbol = this.stockDefault;
      //esse stock vai vim via props
      // <kvm-stock-price stock-default="symbol"  > </kvm-stock-price>
      this.fetchData(this.stockDefault);
    }
  }

  //com hostData consigo acessar o elemento tag e adicionar uma classe
  //<kvm-stock-price class="acesso aqui"  > </kvm-stock-price>
  hostData() {
    return { class: this.error && 'error' };
  }

  async fetchData(stock: string) {
    try {
      this.isLoading = true;
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${process.env.API_KEY}`);
      if (response.status !== 200) {
        throw new Error('Invalid symbol!');
      }
      const data = await response.json();
      if (!data['Global Quote']['05. price']) {
        throw new Error('Invalid symbol!');
      }
      this.error = null;
      this.price = +data['Global Quote']['05. price'];
    } catch (err) {
      this.price = null;
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }

  handleStock(event: Event) {
    this.stockSymbol = (event.target as HTMLInputElement).value;

    //vou remover o vazio se nao retornar vazio e valido
    if (this.stockSymbol.trim() !== '') {
      return (this.isValidInput = true);
    }
    return (this.isValidInput = false);
  }

  //   https://www.w3schools.com/jsref/event_oninput.asp onInput e parecido com onChange

  render() {
    let content = <span>Please insert symbol</span>;
    if (this.error) {
      content = <span>{this.error}</span>;
    }
    if (this.price) {
      content = <span> Price:${this.price}</span>;
    }
    if (this.isLoading) {
      content = <kvm-spinner></kvm-spinner>;
    }
    return [
      <form onSubmit={this.onFetchData.bind(this)}>
        <input value={this.stockSymbol} onInput={this.handleStock.bind(this)} />
        <button disabled={!this.isValidInput} type="submit">
          <span>Fetch data</span>
        </button>
      </form>,
      <div>{content}</div>,
    ];
  }
}
