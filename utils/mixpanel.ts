import mixpanel, { Dict, Query } from 'mixpanel-browser';

const isProd = process.env.NODE_ENV === 'production';
const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'undefined';

mixpanel.init(token, {
  // Use your project's URL, adding a slug for all Mixpanel requests
  api_host: `${process.env.NEXT_PUBLIC_APP_URL}/mp`,
  debug: !isProd,
});

// eslint-disable-next-line import/prefer-default-export
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
  // TODO: replace any
  track_links: (query: Query, name: string, callback?: (e: any) => any) => {
    mixpanel.track_links(query, name, (e: any) => {
      const callbackObj = callback ? callback(e) : {};

      return {
        referrer: document.referrer,
        ...(callbackObj || {}),
      };
    });
  },
  register: (options: object) => {
    mixpanel.register(options);
  },
  people: {
    set: (props: Dict) => {
      mixpanel.people.set(props);
    },
  },
};
