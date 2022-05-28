# Stock Price
Aplicação para gerar dados de preço de companhias, fetch na api [Alpha](https://www.alphavantage.co/)

## Motivacao
Aplicar e fortalecer novos conceitos relacionados a stencil para construcao de web component

## Feature
- Usei o decorador Watch para monitorar uma props minha na tag <kvm-stock-price></kvm-stok-price>,toda vez qeu ela alterar refletiria automatico na classe
- Apenas o decorador e a funcoa e o suficiente para executar toda logica de negocio,essa funcao recebe dois argumetnos o novo valor e o antigo
- Utilizei tambem um recurso para adicionar de forma dinamica classe no host,assim toda vez que gerava erro o host todo poderia ser estilizado de acordo com o erro
- Exemplo abaixo esta o uso do Watch e hostData
- Para o Watch funcionar corretamente precisa dos metodos mutable,reflect na @Prop

```typescript

@Watch('stockDefault')
  watchStockDefault(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.stockSymbol = newValue;
      this.isValidInput = true;
      this.fetchData(newValue);
    }
  }
  
  
 hostData() {
    return { class: this.error && 'error' };
 }  

```

## 

- Utilizei meus proprios (eventos)[https://stenciljs.com/docs/e] customizados e disparei ele entre componentes diferentes
- Para isto funcionar preciso do decorador  @Listen na funcao recebera evento, decorador @Event quem ira disparar
- Para funcao que recebera o evento e simplemente o decorador @Listem e abaixo a logica de negocio nesse caso uma funcao,esta logica executada automatica assim que dispara o evento
- Precisa do argumento que sera o nome do evento criado , e o segundo argumento e o alvo normlamente body
- Abaixo repara que @Listen recebe em string o nome do evento ucSymbolSelected e o argumento target
- Quem emit o evento e necessario usar o metodo bubbles e composed,eles irao fazer com que o evento seja espalhado pela arvore DOm
- Valor emitido no evento e atraves do metodo emit() , o valor que esta sendo emetido fica em (detail)[https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail]

```typescript 

export class StockPrice {

//arquivo que recebo evento
@Listen('ucSymbolSelected', { target: 'body' })
  symbolSelectedHandler(event: CustomEvent<string>) {
    //vou receber valor que passei pelo emit do event no event.detail
    if (event.detail && event.detail !== this.stockDefault) {
      this.error = null;
      this.stockDefault = event.detail;
    }
  }

}
//arquivo que dispara o evento

export class StockFind {
 @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<string>;

handleSymbolSelected(symbol: string) {
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
        {/*precisa ser <kvm-spinner></kvm-spinner>, nao pose ser auto close*/}
        {this.isLoading && <kvm-spinner></kvm-spinner>}
        {this.stock &&
          !this.isLoading &&
          this.stock.map(it => (
            <li class={this.symbolAtribute === it.symbol && 'selectedSymbol'} onClick={this.handleSymbolSelected.bind(this, it.symbol)}>
              <strong>{it.symbol}</strong> - {it.name}
            </li>
          ))}
      </ul>,
    ];
  }


}
```
## 
- Utilizei (ciclos de vida)[https://stenciljs.com/docs/component-lifecycle#componentdidload] do Stencil
- componentDidLoad() e carregado assim que o render e chamado e apenas uma vez
- Este cilo e ideal para chamadas em api e desejamos que monte arvore com o valor desejado apos fetch
- Trabalhei com variaveis de css tambem segue mesmo principio que normalmente fazemos
- Para componetizar e aproveitar elementos precisa apenas criar componente normlamente com classe e usar a tag do componetente
- Neste caso abaixo e o <kvm-spinner></kvm-spinner>


``` typscript
export class StockPrice  {
  componentDidLoad() {
    if (this.stockDefault) {
      this.stockSymbol = this.stockDefault;
      //esse stock vai vim via props
      // <kvm-stock-price stock-default="symbol"  > </kvm-stock-price>
      this.fetchData(this.stockDefault);
    }
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
```



