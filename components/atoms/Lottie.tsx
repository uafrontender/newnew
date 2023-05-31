import React from 'react';
import lottie from 'lottie-web';

interface ILottie {
  ref?: any;
  eventListeners?: {}[];
  options: {
    loop?: boolean;
    autoplay?: boolean;
    animationData?: any;
    rendererSettings?: boolean;
    segments?: [];
  };
  height: string | number;
  width: string | number;
  isStopped?: boolean;
  isPaused?: boolean;
  speed?: number;
  segments?: number[] | undefined;
  direction?: number;
  ariaRole?: string;
  ariaLabel?: string;
  isClickToPauseDisabled?: boolean;
  title?: string;
  style?: object;
}

class Lottie extends React.Component<ILottie> {
  static defaultProps = {
    eventListeners: [],
    isStopped: false,
    isPaused: false,
    speed: 1,
    ariaRole: 'button',
    ariaLabel: 'animation',
    isClickToPauseDisabled: false,
    title: '',
  };

  private el: any;

  private anim: any;

  private options: {} | undefined;

  componentDidMount() {
    const { options, eventListeners } = this.props;

    const { loop, autoplay, animationData, rendererSettings, segments } =
      options;

    this.options = {
      loop,
      autoplay,
      animationData,
      rendererSettings,
      renderer: 'svg',
      segments: !segments,
      container: this.el,
    };

    this.options = { ...this.options, ...options };

    // @ts-ignore
    this.anim = lottie.loadAnimation(this.options);
    this.registerEvents(
      eventListeners as {
        callback: () => void;
        eventName: string;
      }[]
    );
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate(nextProps: any) {
    /* Recreate the animation handle if the data is changed */
    // @ts-ignore
    if (this.options.animationData !== nextProps.options.animationData) {
      this.deRegisterEvents(
        // eslint-disable-next-line react/destructuring-assignment
        this.props.eventListeners as {
          callback: () => void;
          eventName: string;
        }[]
      );
      this.destroy();
      this.options = { ...this.options, ...nextProps.options };
      // @ts-ignore
      this.anim = lottie.loadAnimation(this.options);
      this.registerEvents(nextProps.eventListeners);
    }
  }

  componentDidUpdate() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.isStopped) {
      this.stop();
      // eslint-disable-next-line react/destructuring-assignment
    } else if (this.props.segments) {
      this.playSegments();
    } else {
      this.play();
    }

    this.pause();
    this.setSpeed();
    this.setDirection();
  }

  componentWillUnmount() {
    this.deRegisterEvents(
      // eslint-disable-next-line react/destructuring-assignment
      this.props.eventListeners as {
        callback: () => void;
        eventName: string;
      }[]
    );
    this.destroy();
    // @ts-ignore
    this.options.animationData = null;
    this.anim = null;
  }

  handleClickToPause = () => {
    // The pause() method is for handling pausing by passing a prop isPaused
    // This method is for handling the ability to pause by clicking on the animation
    if (this.anim.isPaused) {
      this.anim.play();
    } else {
      this.anim.pause();
    }
  };

  setSpeed() {
    // eslint-disable-next-line react/destructuring-assignment
    this.anim.setSpeed(this.props.speed);
  }

  setDirection() {
    // eslint-disable-next-line react/destructuring-assignment
    this.anim.setDirection(this.props.direction);
  }

  play() {
    this.anim.play();
  }

  playSegments() {
    // eslint-disable-next-line react/destructuring-assignment
    this.anim.playSegments(this.props.segments);
  }

  stop() {
    this.anim.stop();
  }

  pause() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.props.isPaused && !this.anim.isPaused) {
      this.anim.pause();
      // eslint-disable-next-line react/destructuring-assignment
    } else if (!this.props.isPaused && this.anim.isPaused) {
      this.anim.pause();
    }
  }

  destroy() {
    this.anim.destroy();
  }

  registerEvents(
    eventListeners: {
      callback: () => void;
      eventName: string;
    }[]
  ) {
    eventListeners.forEach((eventListener) => {
      this.anim.addEventListener(
        eventListener.eventName,
        eventListener.callback
      );
    });
  }

  deRegisterEvents(
    eventListeners: {
      callback: () => void;
      eventName: string;
    }[]
  ) {
    eventListeners.forEach((eventListener) => {
      this.anim.removeEventListener(
        eventListener.eventName,
        eventListener.callback
      );
    });
  }

  render() {
    const {
      width,
      height,
      ariaRole,
      ariaLabel,
      isClickToPauseDisabled,
      title,
    } = this.props;

    const getSize = (initial: string | number) => {
      let size;

      if (typeof initial === 'number') {
        size = `${initial}px`;
      } else {
        size = initial || '100%';
      }

      return size;
    };

    const lottieStyles = {
      width: getSize(width),
      height: getSize(height),
      overflow: 'hidden',
      margin: '0 auto',
      outline: 'none',
      // eslint-disable-next-line react/destructuring-assignment
      ...(this.props.style || {}),
    };

    const onClickHandler = isClickToPauseDisabled
      ? () => null
      : this.handleClickToPause;

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        ref={(c) => {
          this.el = c;
        }}
        role={ariaRole}
        title={title}
        style={lottieStyles}
        onClick={onClickHandler}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-label={ariaLabel}
      />
    );
  }
}

export default Lottie;
