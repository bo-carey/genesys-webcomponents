import { newE2EPage } from '@stencil/core/testing'

describe('genesys-disclosure-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<genesys-disclosure-button></genesys-disclosure-button>');
    const element = await page.find('genesys-disclosure-button');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<genesys-disclosure-button></genesys-disclosure-button>');
    const component = await page.find('genesys-disclosure-button');
    const element = await page.find('genesys-disclosure-button >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('first', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('last', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('middle', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
