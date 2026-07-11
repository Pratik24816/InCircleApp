import { motion } from 'framer-motion';

export type PhoneVisual =
  | 'feed'
  | 'details'
  | 'join'
  | 'create'
  | 'events'
  | 'notifications'
  | 'chats'
  | 'profile';

type ScreenProps = { active: boolean };

function StatusBar() {
  return (
    <div className="ui-status">
      <span className="ui-status__time">9:41</span>
      <div className="ui-status__icons" aria-hidden>
        <span className="ui-status__signal" />
        <span className="ui-status__wifi" />
        <span className="ui-status__battery" />
      </div>
    </div>
  );
}

function TabBar({ active }: { active: PhoneVisual }) {
  const tabs = [
    { id: 'feed', icon: '🏠' },
    { id: 'events', icon: '📅' },
    { id: 'create', icon: '➕' },
    { id: 'chats', icon: '💬' },
    { id: 'profile', icon: '👤' },
  ] as const;

  const activeMap: Record<PhoneVisual, string> = {
    feed: 'feed',
    details: 'feed',
    join: 'feed',
    create: 'create',
    events: 'events',
    notifications: 'feed',
    chats: 'chats',
    profile: 'profile',
  };

  const on = activeMap[active];

  return (
    <div className="ui-tabbar">
      {tabs.map(t => (
        <span
          key={t.id}
          className={`ui-tabbar__item ${on === t.id ? 'ui-tabbar__item--on' : ''}`}
        >
          {t.icon}
        </span>
      ))}
    </div>
  );
}

export function FeedScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--feed">
      <StatusBar />
      <motion.div
        className="ui-tonight"
        initial={{ opacity: 0, x: -12 }}
        animate={active ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2 }}
      >
        <span className="ui-tonight__label">Tonight</span>
        <div className="ui-tonight__chips">
          {['🌙 Walk', '☕ Chai', '🏏 Cricket'].map((c, i) => (
            <motion.span
              key={c}
              className={`ui-chip ${i === 2 ? 'ui-chip--active' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={active ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </motion.div>
      <motion.article
        className="ui-activity"
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4 }}
      >
        <div className="ui-activity__cover ui-activity__cover--cricket">
          <div className="ui-activity__cover-shine" />
          <span className="ui-activity__badge">Featured</span>
          <span className="ui-activity__cover-emoji" aria-hidden>
            🏏
          </span>
        </div>
        <div className="ui-activity__body">
          <h4 className="ui-activity__heading">Cricket at Riverfront</h4>
          <div className="ui-activity__meta">
            <span>📍 Sabarmati Riverfront</span>
            <span>· 0.8 km</span>
          </div>
          <div className="ui-activity__avatars">
            {[0, 1, 2].map(i => (
              <span key={i} className="ui-avatar" style={{ ['--i' as string]: i }} />
            ))}
            <span className="ui-activity__count">+4 going</span>
          </div>
          <motion.button type="button" className="ui-hop-btn" animate={active ? { scale: [1, 1.03, 1] } : {}} transition={{ duration: 1.4, repeat: Infinity }}>
            Hop In 🔥
          </motion.button>
        </div>
      </motion.article>
      <TabBar active="feed" />
    </div>
  );
}

export function DetailsScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--details">
      <motion.div
        className="ui-details__hero"
        initial={{ scale: 1.08 }}
        animate={active ? { scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="ui-details__hero-shine" />
      </motion.div>
      <motion.div
        className="ui-details__body"
        initial={{ opacity: 0, y: 16 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
      >
        <div className="ui-details__title">Riverfront Walk</div>
        <div className="ui-details__host">
          <span className="ui-avatar" />
          <span>Hosted by Priya</span>
        </div>
        <motion.span
          className="ui-details__countdown"
          animate={active ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Starts in 2h 15m
        </motion.span>
        <div className="ui-details__tags">
          {['chill', 'walk', 'tonight'].map((t, i) => (
            <motion.span
              key={t}
              className="ui-chip ui-chip--sm"
              initial={{ opacity: 0, x: -8 }}
              animate={active ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.35 + i * 0.08 }}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <motion.button type="button" className="ui-hop-btn ui-hop-btn--lg" initial={{ opacity: 0, y: 8 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          Hop In 🔥
        </motion.button>
      </motion.div>
    </div>
  );
}

export function JoinScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--join">
      <motion.div className="ui-toast" initial={{ opacity: 0, y: -40 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, type: 'spring' }}>
        <span className="ui-toast__icon">🍿</span>
        <div>
          <p className="ui-toast__title">Certified legend 🔥</p>
          <p className="ui-toast__body">You&apos;re In for Riverfront Walk</p>
        </div>
      </motion.div>
      <motion.div className="ui-join-center" initial={{ opacity: 0, scale: 0.5 }} animate={active ? { opacity: 1, scale: 1 } : {}} transition={{ type: 'spring', delay: 0.1 }}>
        <motion.div className="ui-join-check" initial={{ scale: 0 }} animate={active ? { scale: 1 } : {}} transition={{ delay: 0.2, type: 'spring' }}>
          ✓
        </motion.div>
        <p className="ui-join-title">You&apos;re In</p>
        <span className="ui-join-sub">See you tonight</span>
      </motion.div>
      {active ? Array.from({ length: 6 }).map((_, i) => (
        <motion.span key={i} className="ui-confetti" style={{ ['--i' as string]: i }} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0], y: [0, -24 - i * 6] }} transition={{ delay: 0.25 + i * 0.05, duration: 1 }} />
      )) : null}
    </div>
  );
}

export function CreateScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--create">
      <StatusBar />
      <motion.div className="ui-create__progress" initial={{ scaleX: 0 }} animate={active ? { scaleX: 1 } : {}} transition={{ delay: 0.2, duration: 0.6 }} />
      <motion.div className="ui-create__field" initial={{ opacity: 0, y: 10 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 }}>
        <span className="ui-create__label">Plan name</span>
        <div className="ui-create__input">Sunset cricket match</div>
      </motion.div>
      <motion.div className="ui-create__chips" initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ delay: 0.35 }}>
        {['Tonight', 'Tomorrow', 'Weekend'].map((c, i) => (
          <span key={c} className={`ui-chip ${i === 0 ? 'ui-chip--active' : ''}`}>{c}</span>
        ))}
      </motion.div>
      <motion.div className="ui-create__preview" initial={{ opacity: 0, scale: 0.95 }} animate={active ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.45 }}>
        <span className="ui-create__preview-label">Live preview</span>
        <div className="ui-activity ui-activity--mini">
          <div className="ui-activity__cover ui-activity__cover--cricket ui-activity__cover--alt" />
          <p className="ui-activity__heading ui-activity__heading--sm">Sunset cricket match</p>
        </div>
      </motion.div>
      <motion.div className="ui-create__footer" initial={{ opacity: 0, y: 20 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 }}>
        <button type="button" className="ui-create__btn ui-create__btn--ghost">Preview</button>
        <button type="button" className="ui-create__btn ui-create__btn--pub">Publish 🔥</button>
      </motion.div>
      <TabBar active="create" />
    </div>
  );
}

export function EventsScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--events">
      <StatusBar />
      <div className="ui-events__tabs">
        {['Joined', 'Created', 'Done'].map((t, i) => (
          <motion.span key={t} className={`ui-events__tab ${i === 0 ? 'ui-events__tab--on' : ''}`} initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ delay: 0.15 + i * 0.06 }}>
            {t}
          </motion.span>
        ))}
      </div>
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="ui-events__row"
          initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
          animate={active ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 + i * 0.12 }}
        >
          <div className="ui-events__row-cover" />
          <div className="ui-events__row-body">
            <div className="ui-events__row-title">
              {i === 0 ? 'Cricket at Riverfront' : 'CG Road brunch'}
            </div>
            <span className="ui-events__row-meta">{i === 0 ? 'Tonight · 7:30 PM' : 'Sat · CG Road'}</span>
          </div>
          <span className="ui-events__badge">{i === 0 ? 'In' : 'Host'}</span>
        </motion.div>
      ))}
      <TabBar active="events" />
    </div>
  );
}

export function NotificationsScreen({ active }: ScreenProps) {
  const items = [
    { title: 'Plot twist 🍿', body: 'Ravi joined your cricket plan', unread: true },
    { title: 'Certified legend 🔥', body: "You're In for Riverfront Walk", unread: true },
    { title: 'Last call energy 🚨', body: '1 spot left — Weekend brunch', unread: false },
  ];
  return (
    <div className="ui-screen ui-screen--notifications">
      <motion.div className="ui-notif__header" initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}}>
        <span>🔔</span> Notifications
      </motion.div>
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          className={`ui-notif__row ${item.unread ? 'ui-notif__row--unread' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={active ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.1 }}
        >
          {item.unread ? <span className="ui-notif__dot" /> : null}
          <div>
            <p className="ui-notif__title">{item.title}</p>
            <p className="ui-notif__body">{item.body}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ChatsScreen({ active }: ScreenProps) {
  const chats = [
    { name: 'Riverfront crew', msg: 'See you at the gate!', time: '2m' },
    { name: 'Cricket match', msg: 'Bringing the ball 🏏', time: '1h' },
    { name: 'Priya', msg: 'Hop in confirmed ✓', time: '3h' },
  ];
  return (
    <div className="ui-screen ui-screen--chats">
      <StatusBar />
      <motion.p className="ui-chats__title" initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}}>Chats</motion.p>
      {chats.map((c, i) => (
        <motion.div
          key={c.name}
          className="ui-chats__row"
          initial={{ opacity: 0, y: 12 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.1 }}
        >
          <span className="ui-avatar ui-avatar--chat" style={{ ['--i' as string]: i }} />
          <div className="ui-chats__body">
            <div className="ui-chats__name">{c.name}</div>
            <div className="ui-chats__msg">{c.msg}</div>
          </div>
          <span className="ui-chats__time">{c.time}</span>
        </motion.div>
      ))}
      <TabBar active="chats" />
    </div>
  );
}

export function ProfileScreen({ active }: ScreenProps) {
  return (
    <div className="ui-screen ui-screen--profile">
      <StatusBar />
      <motion.div className="ui-profile__hero" initial={{ opacity: 0, scale: 0.9 }} animate={active ? { opacity: 1, scale: 1 } : {}} transition={{ type: 'spring' }}>
        <span className="ui-avatar ui-avatar--profile" />
        <p className="ui-profile__name">You</p>
        <p className="ui-profile__city">📍 Ahmedabad</p>
      </motion.div>
      <div className="ui-profile__stats">
        {[
          { v: '12', l: 'Joined' },
          { v: '3', l: 'Hosted' },
          { v: '28', l: 'Friends' },
        ].map((s, i) => (
          <motion.div key={s.l} className="ui-profile__stat" initial={{ opacity: 0, y: 10 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 + i * 0.08 }}>
            <span className="ui-profile__stat-v">{s.v}</span>
            <span className="ui-profile__stat-l">{s.l}</span>
          </motion.div>
        ))}
      </div>
      {['Interests', 'Notifications', 'Settings'].map((row, i) => (
        <motion.div key={row} className="ui-profile__row" initial={{ opacity: 0, x: -12 }} animate={active ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.08 }}>
          {row} <span>›</span>
        </motion.div>
      ))}
      <TabBar active="profile" />
    </div>
  );
}

export function PhoneScreen({ visual, active }: { visual: PhoneVisual; active: boolean }) {
  switch (visual) {
    case 'feed':
      return <FeedScreen active={active} />;
    case 'details':
      return <DetailsScreen active={active} />;
    case 'join':
      return <JoinScreen active={active} />;
    case 'create':
      return <CreateScreen active={active} />;
    case 'events':
      return <EventsScreen active={active} />;
    case 'notifications':
      return <NotificationsScreen active={active} />;
    case 'chats':
      return <ChatsScreen active={active} />;
    case 'profile':
      return <ProfileScreen active={active} />;
    default:
      return <FeedScreen active={active} />;
  }
}
