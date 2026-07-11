import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import './sections.css';

const beats = [
  {
    act: 'Act I',
    title: 'The scroll ends here.',
    body: 'You know the feeling. Infinite feeds, zero plans. Another night wondering if something’s happening — or if you’re just… not invited.',
    accent: false,
  },
  {
    act: 'Act II',
    title: 'Then the city whispers.',
    body: 'A cricket match by the river. A study group at the café. Someone’s walking the heritage trail at sunrise. Real people. Real places. Right now.',
    accent: true,
  },
  {
    act: 'Act III',
    title: 'You tap one button.',
    body: "Hop in. No forms. No awkward group chats. Just you, showing up — with people who actually want to be there.",
    accent: false,
  },
];

export function StorySection() {
  const [ref, inView] = useInView<HTMLElement>();

  return (
    <section ref={ref} className="section story" id="story">
      <div className="container">
        <motion.p
          className="section__eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          The story
        </motion.p>

        <motion.h2
          className="section__title"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Not another social app.
          <br />
          <span className="gradient-text">A trailer for your next memory.</span>
        </motion.h2>

        <div className="story__beats">
          {beats.map((beat, i) => (
            <motion.article
              key={beat.act}
              className={`story__beat ${beat.accent ? 'story__beat--accent' : ''}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
            >
              <span className="story__act">{beat.act}</span>
              <h3 className="story__beat-title">{beat.title}</h3>
              <p className="story__beat-body">{beat.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
