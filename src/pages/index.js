import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container text--center">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">Bienvenue sur mon rapport d'alternance</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/accueil">
            🚀 Accueil
          </Link>
          <Link className="button button--outline button--lg margin-horiz--sm" to="/docs/accueil">
            👥 Présentation de l'équipe
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/accueil">
            🔍 Recherche de demande
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
