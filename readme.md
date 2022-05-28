# Stock Price

Aplicação para gerar dados de preço de companhias, fetch na api [Alpha](https://www.alphavantage.co/)</br>
[Publicado](https://www.npmjs.com/package/kvm-stock-price-web-component)

## Motivação

Aplicar e fortalecer novos conceitos relacionados a stencil para construção de web component

## Como iniciar projeto

- Install como dev dependência
- npm i kvm-stock-price-web-component

## Como usar

- Precisa registrar o pacote, lembra-se isto e um web componente , simplesmente html e javascript
- Você precisa importar dentro de 'kvm-stock-price-web-component/dist/loader',defineCustomElements
- Abaixo esta um exemplo, normalmente você ira usar essa abordagem na maior hierarquia do seu framework or lib
- React(index.js), Vue(main.js) e angular(main.ts)

```typescript
import { defineCustomElements } from 'kvm-stock-price-web-component/loader';

defineCustomElements(window);
```

- Apos definir o componente, utiliza como tag comum de hmtl, não precisa fazer mais nada além disso
- Tags disponíveis são <kvm-stock-price ></kvm-stock-price> <kvm-stock-find><kvm-stock-find><kvm-stock-find>
- Tag kvm-stock-price aceita um atributo stock-default
- stock-default espera uma string corresponde a uma sigla exemplo: IBM
- Se stock-default existir,ira automaticamente assim pagina carregar, fazer uma requisição na api e retornar o preço correspondente
- Não conhece as siglas,pode usar a tag stock-find para encontrar as siglas disponíveis
- Abaixo esta exemplo de uso em qualquer frameWork ou lib

```typescript
//tag idêntico  ao html <button><a>
<kvm-stock-price />
<kvm-stock-price stock-default="IBM">
<kvm-stock-find />

```

## Objetivo

- Gerar o valor da companhia de acordo com a sigla colocada,usando dados da [ALPHA VANTAGE](https://www.alphavantage.co/)

## CSS

- Deseja customizar seus estilos
- Pode sobrescrever as variaveis de cor de css com abordagem de [variáveis](https://developer.mozilla.org/pt-BR/docs/Web/CSS/Using_CSS_custom_properties) em css
- As variaveis disponíveis estão abaixo
- Para saber em quais arquivos irão gerar efeitos pode consultar o arquivo [fonte](https://github.com/kenjimaeda54/stock-price-stenciljs/blob/develop/src/components/stock-price/stock-price.css)

```html
<style>
  html {
    --color-primary: #3b013b;
    --color-error: #4b099b;
    --color-white: white;
    --color-disabled: gray;
  }
</style>
```

## Bugs

- Para react com typescript não acusar erro e compreender que e um custom elemento, você precisa aplicar polimorfismo
- Para isto usa a interface IntrinsicElement, abaixo esta, exemplo
- Nome do arquivo declaration.d.ts na raiz do projeto

```typescript
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'kvm-stock-price': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'kvm-stock-find': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
```

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
- As variáveis apenas surgiram efeitos se existir na raiz do projeto quem for usar, então precisa coloca uma cor default para suas variáveis, pois se não existir serão essas que serão usadas
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

- Para publicar e integrar, pode seguir esse [tutorial](https://medium.com/stencil-tricks/publishing-and-integrating-a-stenciljs-reusable-web-component-in-react-66f852582f6b)

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
