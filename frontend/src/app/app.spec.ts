import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { MessageService } from './core/messages/message.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Lista de tareas');
  });

  it('should link to the trash in the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const link = (fixture.nativeElement as HTMLElement).querySelector('nav a[href="/tasks/trash"]');
    expect(link?.textContent?.trim()).toBe('Papelera');
  });

  it('should link to the templates in the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const link = (fixture.nativeElement as HTMLElement).querySelector('nav a[href="/templates"]');
    expect(link?.textContent?.trim()).toBe('Plantillas');
  });

  it('should show the last error and hide it when closed', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(MessageService).showError('No se ha encontrado el elemento.');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="alert"]')?.textContent).toContain('No se ha encontrado el elemento.');

    compiled.querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    await fixture.whenStable();
    expect(compiled.querySelector('[role="alert"]')).toBeNull();
  });
});
