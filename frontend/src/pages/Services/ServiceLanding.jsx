import { memo, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCaseStudyBySlug } from "../../data/caseStudies";
import {
  getServiceLandingBySlug,
  getPackagesByIds,
  formatWebPackagePrice,
  formatAiPackagePrice,
  detectDefaultCurrency,
} from "../../data/services";
import { usePageSEO } from "../../utils/seo";
import {
  Section,
  SectionHeading,
  Card,
  Tag,
  Button,
  Reveal,
  Eyebrow,
  Rule,
} from "../../components/ui";

function packagePrice(pack, currency) {
  if (pack.priceInr || pack.priceUsd) {
    return formatWebPackagePrice(pack, currency);
  }
  return formatAiPackagePrice(pack, currency);
}

const ServiceLanding = memo(function ServiceLanding() {
  const { slug } = useParams();
  const landing = getServiceLandingBySlug(slug);
  const seoPath = landing ? `/services/${landing.slug}` : null;
  const currency = useMemo(() => detectDefaultCurrency(), []);

  usePageSEO(undefined, seoPath || undefined);

  if (!landing) {
    return <Navigate to="/services" replace />;
  }

  const packages = getPackagesByIds(landing.relatedPackageIds);
  const caseStudies = landing.relatedCaseStudySlugs
    .map((studySlug) => getCaseStudyBySlug(studySlug))
    .filter(Boolean);

  return (
    <article className="flex flex-col gap-12 md:gap-16 w-full pb-8">
      <Reveal>
        <header className="flex flex-col gap-4 mt-2">
          <Eyebrow>
            <Link to="/" className="underline underline-offset-4">
              Home
            </Link>
            <span aria-hidden> / </span>
            <Link to="/services" className="underline underline-offset-4">
              Services
            </Link>
            <span aria-hidden> / </span>
            {landing.title}
          </Eyebrow>
          <h1 className="font-headline-xl text-[clamp(2rem,5vw,3.75rem)] leading-[1] tracking-tight normal-case max-w-4xl w-fit bg-surface border-4 border-outline p-4 md:p-6 shadow-[8px_8px_0_0_var(--shadow-color)]">
            {landing.title}
          </h1>
          <p className="font-body-lg text-base md:text-lg max-w-3xl text-on-surface-variant leading-snug">
            {landing.description}
          </p>
          <Rule />
          <div className="flex flex-wrap gap-2">
            {landing.keywords.slice(0, 6).map((keyword) => (
              <Tag key={keyword}>{keyword}</Tag>
            ))}
          </div>
        </header>
      </Reveal>

      <Reveal>
        <Section aria-labelledby="landing-process-heading">
          <SectionHeading id="landing-process-heading" eyebrow="01 — Process" title="How we work" />
          <ol className="list-none flex flex-col gap-3 font-body-md text-sm md:text-base leading-snug max-w-3xl">
            {landing.process.map((step, index) => (
              <li key={step} className="flex gap-3 border-l-2 border-outline pl-4">
                <span className="font-label-bold text-[10px]  tracking-[0.14em] text-text-muted shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      </Reveal>

      {packages.length > 0 ? (
        <Reveal>
          <Section aria-labelledby="landing-packages-heading">
            <SectionHeading
              id="landing-packages-heading"
              eyebrow="02 — Packages"
              title="Matching packages"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pack) => (
                <Card key={pack.id} className="p-5 flex flex-col gap-2">
                  <h3 className="font-headline-md text-lg normal-case tracking-tight">{pack.name}</h3>
                  <p className="font-body-md text-sm text-on-surface-variant leading-snug">
                    {pack.summary || pack.bestFor}
                  </p>
                  <p className="font-label-bold text-[11px]  tracking-[0.14em] mt-auto pt-2">
                    From {packagePrice(pack, currency)}
                  </p>
                </Card>
              ))}
            </div>
          </Section>
        </Reveal>
      ) : null}

      {caseStudies.length > 0 ? (
        <Reveal>
          <Section aria-labelledby="landing-work-heading">
            <SectionHeading id="landing-work-heading" eyebrow="03 — Work" title="Related case studies" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseStudies.map((study) => (
                <Link
                  key={study.slug}
                  to={`/work/${study.slug}`}
                  className="border border-outline-variant bg-surface p-5 hover:border-outline hover:shadow-[6px_6px_0_0_var(--shadow-color)] transition-[box-shadow,border-color] duration-200"
                >
                  <h3 className="font-headline-md text-lg normal-case tracking-tight mb-2">
                    {study.title}
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant leading-snug">
                    {study.oneLiner}
                  </p>
                </Link>
              ))}
            </div>
          </Section>
        </Reveal>
      ) : null}

      <Reveal>
        <Section aria-labelledby="landing-faq-heading">
          <SectionHeading id="landing-faq-heading" eyebrow="04 — FAQ" title="Questions" />
          <dl className="flex flex-col gap-5 max-w-3xl">
            {landing.faq.map((item) => (
              <div key={item.q} className="border-b border-outline-variant pb-4">
                <dt className="font-headline-md text-base normal-case tracking-tight mb-1">{item.q}</dt>
                <dd className="font-body-md text-sm text-on-surface-variant leading-snug">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-3">
          <Button to="/services#inquiry">Request a quote</Button>
          <Button to="/services" variant="secondary">
            All packages
          </Button>
        </div>
      </Reveal>
    </article>
  );
});

export default ServiceLanding;
