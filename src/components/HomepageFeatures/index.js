import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Migration vers Angular 2+',
    Svg: require('@site/static/img/undraw_code-inspection_red.svg').default,
    url: '/docs/missions/',
    description: (
      <>
        A travers ce rapport, vous allez découvrir l'une de mes missions principales : la migration en angular 2+ et l'amélioration de composants
      </>
    ),
  },
  {
    title: 'Nouveaux défis',
    Svg: require('@site/static/img/undraw_developer-activity_red.svg').default,
    url: '/docs/missions/FIX/',
    description: (
      <>
        Au cours de cette année, j'ai aussi contribué à aider mon équipe en corrigeant des bugs et en développant de nouvelles fonctionnalités.
      </>
    ),
  },
  {
    title: "Ce que j'ai appris durant cette année",
    Svg: require('@site/static/img/undraw_proud-coder_red.svg').default,
    url: '',
    description: (
      <>
        En plus des connaissances acquises en entreprise, de nombreux projets personnels m'ont permis d'explorer de nouvelles technologies, comme le framework Java Spring, et de développer de nouvelles compétences.
      </>
    ),
  },
];

function Feature({Svg, title, description,url}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
        <Link to={url}>{title}</Link>
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
