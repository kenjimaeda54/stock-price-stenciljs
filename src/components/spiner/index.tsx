import { h, Component } from '@stencil/core';

@Component({
  tag: 'kvm-spinner',
  styleUrl: './styles.css',
  shadow: true,
})
export class Spinner {
  render() {
    return <div class="lds-dual-ring"></div>;
  }
}
