import './marquee.css';

const items = [
  'Riverfront walks',
  'Pickup cricket',
  'Study sessions',
  'Sunrise cycling',
  'Chai & conversations',
  'Heritage trails',
  'Board game nights',
  'Morning yoga',
  'Photography walks',
  'Food crawls',
];

export function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee__item">
            <span className="marquee__dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
