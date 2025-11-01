import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.logoContainer}>
          <img 
            src="/img/wargames_logo.webp" 
            alt="Wargames Logo" 
            className={styles.homeLogo}
          />
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          Wargames BataMladen
        </Heading>
        <p className={styles.heroSubtitle}>Play. Learn. Conquer.</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="https://wargames.batamladen.com"
            style={{marginLeft: '1rem'}}>
            Visit Platform
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({icon, title, children}) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>
        <i className={icon}></i>
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--4">
            <FeatureCard icon="fas fa-terminal" title="Challenge Documentation">
              Complete walkthroughs and solutions for all cybersecurity challenges. Learn advanced techniques and methodologies.
            </FeatureCard>
          </div>
          <div className="col col--4">
            <FeatureCard icon="fas fa-graduation-cap" title="Learning Academy">
              Comprehensive guides covering red team, blue team, and problem-solving skills. Progress from beginner to expert.
            </FeatureCard>
          </div>
          <div className="col col--4">
            <FeatureCard icon="fas fa-trophy" title="Scoreboard & Rankings">
              Track your progress, earn Aura Points, and compete with other cybersecurity enthusiasts worldwide.
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <div className={styles.quickStartCard}>
          <h2 className={styles.sectionTitle}>Quick Start</h2>
          <p>Get started with Wargames BataMladen in minutes. Here's a basic example of how to connect to our challenges:</p>
          
          <pre className={styles.codeBlock}>
            <code>{`# Connect to a challenge via SSH
ssh username@wargames.batamladen.com -p [PORT_NUMBER]

# Example for Level 1 of a challenge
ssh player@wargames.batamladen.com -p 2220
# Password: [Entry point password provided in challenge description]`}</code>
          </pre>
          
          <p>Each challenge consists of multiple levels that progressively increase in difficulty. Find flags to advance to the next level!</p>
          
          <div className={styles.buttons}>
            <Link
              className="button button--secondary"
              to="/docs/challenges/intro">
              View All Challenges
            </Link>
            <Link
              className="button button--outline"
              to="/docs/guides/ssh-basics"
              style={{marginLeft: '1rem'}}>
              SSH Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoSection() {
  return (
    <section className={styles.infoSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <div className={styles.infoCard}>
              <h3 className={styles.sectionTitle}><i className="fas fa-shield-alt" style={{marginRight: '0.5rem'}}></i> Rules & Guidelines</h3>
              <ul>
                <li>No DoS attacks of any kind</li>
                <li>Don't bruteforce flag submission</li>
                <li>Report any bugs you find</li>
                <li>Respect other players</li>
                <li>Have fun learning!</li>
              </ul>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.infoCard}>
              <h3 className={styles.sectionTitle}><i className="fas fa-question-circle" style={{marginRight: '0.5rem'}}></i> Need Help?</h3>
              <p>Stuck on a challenge? Check out our resources:</p>
              <ul>
                <li><Link to="/docs/faq">Frequently Asked Questions</Link></li>
                <li><Link to="/docs/writeups">Community Write-ups</Link></li>
                <li><Link to="/docs/contact">Contact Support</Link></li>
                <li><Link to="https://discord.gg/wargames">Join our Discord</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Documentation`}
      description="Complete documentation for Wargames BataMladen - Learn, Play, Conquer">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <HomepageFeatures />
        <QuickStartSection />
        <InfoSection />
      </main>
    </Layout>
  );
}