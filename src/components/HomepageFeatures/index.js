import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Migration vers Angular 2+',
    Svg: require('@site/static/img/undraw_code-inspection.svg').default,
    description: (
      <>
        A travers ce rapport, vous allez découvrir l'une de mes missions principales : la migration et l'amélioration de composants
      </>
    ),
  },
  {
    title: 'Nouveaux défis',
    Svg: require('@site/static/img/undraw_developer-activity.svg').default,
    description: (
      <>
        Au cours de cette année, j'ai aussi contribué à aider mon équipe en corrigeant des bugs et en développant de nouvelles fonctionnalités.
      </>
    ),
  },
  {
    title: "Qu'est-ce que j'ai appris durant cette année",
    Svg: require('@site/static/img/undraw_proud-coder.svg').default,
    description: (
      <>
        En plus des connaissances acquises en entreprise, de nombreux projets personnels m'ont permis d'explorer de nouvelles technologies, comme l'IA, et de développer de nouvelles compétences.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
        <Link to="docs/category/présentation">{title}</Link>
          </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
