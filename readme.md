# Stock Price

Aplicação para gerar dados de preço de companhias, fetch na api [Alpha](https://www.alphavantage.co/)

## Motivação

Aplicar e fortalecer novos conceitos relacionados a stencil para construção de web component

## Como iniciar projeto

- Install como dev dependencia
- npm i kvm-stock-price-web-component

## Como usar

- Precisa registrar o pacote, lembra-se isto e um web componente , simplemente html e javascript
- Você precisa importar dentro de 'kvm-stock-price-web-component/dist/loader',defineCustomElements
- Abaixo esta um exemplo, normalmente você ira utilizar essa abordagem na maior hierarquia do seu framework or lib
- React em index.js, Vue em main.js e angular main.ts

```typescript
import { defineCustomElements } from 'kvm-stock-price-web-component';

defineCustomElements(window);
```

- Apos definir o componente, utilizara como tag comum de hmtl, não precisa fazer mais nadazer mais nada
- Tags disponíveis são <kvm-stock-price ></kvm-stock-price> <kvm-stock-find><kvm-stock-find>d><kvm-stock-find>
- Tag kvm-stock-price aceita um atributo que chama stock-default
- stock-default espera uma string que corresponde a uma sigla exemplo: IBM
- Não conhece as siglas pode usar a tag stock-find para encontrar as siglas disponíveis
- Abaixo esta exemplo de uso em qualquer frameWork ou lib

```typescript
//tag identico  ao html <button><a>
<kvm-stock-price />
<kvm-stock-find />

```

## Objetivo

- Gerar o valor da companhia de acordo com a sigla colocada,usando dados da [ALPHA VANTAGE](https://www.alphavantage.co/)

## Feature do projeto codigo fonte

- Usei o decorador Watch para monitorar uma props minha na tag <kvm-stock-price></kvm-stok-price>, toda vez que ela alterar refletiria automático na classe
- Apenas o decorador e a função e o suficiente para executar toda logica de negócio, essa função recebe dois argumentos o novo valor e o antigo
- Utilizei também um recurso para adicionar de forma dinâmica classe no host, assim toda vez que gerava erro o host todo poderia ser estilizado conforme o erro
- Exemplo abaixo está a uso do Watch e hostData
- Para o Watch funcionar corretamente precisa dos metodos mutable, reflect na @Prop

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

- Utilizei meus próprios [eventos](https://stenciljs.com/docs/e) customizados e disparei ele entre componentes diferentes
- Para isto funcionar preciso do decorador @Listen na função que recebera evento, decorador @Event quem ira disparar
- Para função que recebera o evento e simplesmente o decorador @Listem e abaixo a lógica de negócio nesse caso uma função, ela sera executada automática assim que dispara o evento
- Precisa do argumento que sera o nome do evento criado, e o segundo argumento e o alvo normalmente body
- Abaixo repara que @Listen recebe em string o nome do evento ucSymbolSelected e o argumento target
- Quem emit o evento e necessário usar o método bubbles e composed, eles irão fazer com que o evento seja espalhado pela árvore DOm
- Valor emitido no evento e através do método emit() , o valor que esta sendo emitido fica em [detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)

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

- Utilizei [ciclos de vida](https://stenciljs.com/docs/component-lifecycle#componentdidload) do Stencil
- componentDidLoad() ,carregado assim que o render , chamado e apenas uma vez
- Este cilo e ideal para chamadas em api se desejamos manta arvore com o valor apos fetch
- Trabalhei com variáveis de css segue mesmo principio que normalmente fazemos
- Para componetizar e aproveitar elementos precisa apenas criar componente normalmente com classe e usar a tag do componente
- Neste caso abaixo e o <kvm-spinner></kvm-spinner>

```typescript
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

##

- Trabalhei com variáveis de ambiente usando .env
- Precisa instalar e configurar [plugin rollup-plugin-dotenv](https://medium.com/learnwithrahul/using-environment-variables-with-stenciljs-d3425592fa18) no stencil.config.js
- Apos isto e uso comum do .env

```typescript
import { Config } from '@stencil/core';
import dotenvPlugin from 'rollup-plugin-dotenv';

export const config: Config = {
  namespace: 'stock-price',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  plugins: [dotenvPlugin()],
};
```
