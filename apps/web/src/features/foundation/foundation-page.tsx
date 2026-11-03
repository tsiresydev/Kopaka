'use client';
import { Button, Card, Field, Select, StatusMessage } from '@kopaka/ui';
import { ThemeSelect } from '../preferences/theme-select';
import { HealthStatus } from './health-status';
import { useLocale } from '../preferences/locale-provider';
import { LanguageSelect } from '../preferences/language-select';
export function FoundationPage() {
  const { messages: fr } = useLocale();
  const d = fr.demos;
  return (
    <>
      <a className="skip-link" href="#contenu" tabIndex={0}>
        {fr.skip}
      </a>
      <div className="page-container">
        <header className="site-header">
          <span className="wordmark">Kopaka</span>
          <div className="preferences">
            <LanguageSelect />
            <ThemeSelect />
          </div>
        </header>
        <main id="contenu" tabIndex={-1}>
          <section className="hero">
            <div>
              <h1>{fr.title}</h1>
              <p>{fr.intro}</p>
              <p>{fr.notice}</p>
            </div>
            <HealthStatus />
          </section>
          <section className="demonstrations" aria-labelledby="examples-title">
            <header>
              <h2 id="examples-title">{d.title}</h2>
              <p>{d.description}</p>
            </header>
            <div className="demo-grid">
              <Card title={d.buttons} headingLevel={3}>
                <div className="button-row">
                  <Button>{d.primary}</Button>
                  <Button variant="secondary">{d.secondary}</Button>
                  <Button disabled>{d.disabled}</Button>
                </div>
              </Card>
              <Card title={d.fields} headingLevel={3}>
                <Field label={d.label} help={d.help} />
                <Field
                  label={d.errorLabel}
                  error={d.error}
                  readOnly
                  defaultValue=""
                />
              </Card>
              <Card title={d.select} headingLevel={3}>
                <Select label={d.choice} defaultValue="">
                  <option value="">{d.placeholder}</option>
                  <option value="one">{d.option}</option>
                </Select>
              </Card>
              <Card title={d.card} headingLevel={3}>
                <Card title={d.cardTitle} headingLevel={3} variant="soft">
                  <p>{d.cardBody}</p>
                </Card>
              </Card>
              <Card title={d.states} headingLevel={3} className="demo-states">
                <StatusMessage tone="loading" label={d.loading} />
                <StatusMessage label={d.empty} />
                <StatusMessage tone="error" label={d.failure} />
                <StatusMessage tone="success" label={d.success} />
                <StatusMessage tone="disabled" label={d.inactive} />
              </Card>
            </div>
          </section>
        </main>
        <footer>{fr.notice}</footer>
      </div>
    </>
  );
}
