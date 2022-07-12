import mixpanel, { Dict, Query } from 'mixpanel-browser';

const isProd = process.env.NODE_ENV === 'production';

mixpanel.init(`7a9cf0a6b393eed146cfefd46209c7b6`, {
  // Use your project's URL, adding a slug for all Mixpanel requests
  api_host: `${process.env.NEXT_PUBLIC_APP_URL}/mp`,
  debug: !isProd ? true : false,
});

export const Mixpanel = {
  identify: (id: string) => {
    mixpanel.identify(id);
  },
  alias: (id: string) => {
    mixpanel.alias(id);
  },
  track: (name: string, props?: Dict) => {
    mixpanel.track(name, props);
  },
  track_links: (query: Query, name: string) => {
    mixpanel.track_links(query, name, {
      referrer: document.referrer,
    });
  },
  people: {
    set: (props: Dict) => {
      mixpanel.people.set(props);
    },
  },
};
